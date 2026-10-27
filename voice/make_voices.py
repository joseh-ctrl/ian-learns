"""Makes the natural-voice clips for Bella's app.

Reads voice/lines.json (every sentence the app can say), asks Microsoft's free Edge
read-aloud voices (via the edge-tts package) to speak each one, and writes:
  audio/<id>.mp3        one clip per sentence
  audio/manifest.json   sentence -> clip file (the app reads this)

Run from the repo folder:   python voice/make_voices.py
Safe to re-run: clips that already exist are kept, only new sentences are made.
Optional: VOICE=en-US-JennyNeural python voice/make_voices.py   (to force a voice;
delete the audio folder first so every clip is remade in the new voice).
"""
import asyncio, hashlib, json, os, sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINES = os.path.join(ROOT, 'voice', 'lines.json')
OUT = os.path.join(ROOT, 'audio')
PREFERRED = ['en-US-AvaNeural', 'en-US-EmmaNeural', 'en-US-JennyNeural', 'en-US-AriaNeural']


async def pick_voice():
    if os.environ.get('VOICE'):
        return os.environ['VOICE']
    names = {v['ShortName'] for v in await edge_tts.list_voices()}
    for v in PREFERRED:
        if v in names:
            return v
    sys.exit('None of the preferred voices are available: ' + ', '.join(PREFERRED))


def clip_name(key):
    return hashlib.sha1(key.encode('utf-8')).hexdigest()[:12] + '.mp3'


async def main():
    lines = json.load(open(LINES, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    voice = await pick_voice()
    print(f'Voice: {voice}   Sentences: {len(lines)}')
    manifest, failed = {}, []
    sem = asyncio.Semaphore(6)
    done = 0

    async def one(item):
        nonlocal done
        fn = clip_name(item['k'])
        path = os.path.join(OUT, fn)
        if not (os.path.exists(path) and os.path.getsize(path) > 0):
            async with sem:
                for attempt in range(5):
                    try:
                        rate = '-30%' if item['slow'] else '-5%'
                        await edge_tts.Communicate(item['t'], voice, rate=rate, pitch='+4Hz').save(path)
                        if os.path.getsize(path) > 0:
                            break
                    except Exception as e:  # network hiccup or rate limit: wait and retry
                        if attempt == 4:
                            print('  failed:', item['t'], '-', e)
                        await asyncio.sleep(2 * (attempt + 1))
        if os.path.exists(path) and os.path.getsize(path) > 0:
            manifest[item['k']] = fn
        else:
            failed.append(item['t'])
            if os.path.exists(path):
                os.remove(path)
        done += 1
        if done % 200 == 0:
            print(f'  {done}/{len(lines)}')

    await asyncio.gather(*(one(x) for x in lines))

    # remove clips for sentences the app no longer says
    keep = set(manifest.values())
    removed = 0
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f)); removed += 1

    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(dict(sorted(manifest.items())), fh, ensure_ascii=False, separators=(',', ':'))
    size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)) / 1e6
    print(f'Done: {len(manifest)} clips ({size:.1f} MB), {len(failed)} failed, {removed} old clips removed.')
    if failed:
        print('Re-run the script to retry the failed ones.')


if __name__ == '__main__':
    asyncio.run(main())
