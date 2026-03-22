import pathlib
f = pathlib.Path(r'C:\Users\torit\.gemini\antigravity\scratch\paypay-collect-vercel\public\index.html')
lines = f.read_text(encoding='utf-8').splitlines(keepends=True)
# 377-388行目を削除（1-indexed）=> 376-387 (0-indexed)
del lines[376:388]
f.write_text(''.join(lines), encoding='utf-8')
print('Done. Removed 12 lines. New total:', len(lines))
