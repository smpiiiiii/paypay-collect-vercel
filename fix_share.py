import pathlib

f = pathlib.Path(r'C:\Users\torit\.gemini\antigravity\scratch\paypay-collect-vercel\public\index.html')
lines = f.read_text(encoding='utf-8').splitlines(keepends=True)

# 566行目付近の共有テキスト行を探して置換
for i, line in enumerate(lines):
    if 'var text' in line and 'tierInfo' in line and 'eventName' in line:
        # イベント名+リンクだけのシンプルな共有テキストに置換
        indent = '        '
        lines[i] = indent + "var text = '\\uD83D\\uDCB0 ' + eventName + '\\n\\n\\uD83D\\uDC47 \\u53C2\\u52A0\\u30FB\\u652F\\u6255\\u3044\\u5831\\u544A\\u306F\\u3053\\u3061\\u3089\\n' + url;\r\n"
        print(f'Replaced line {i+1}')
        break
else:
    print('Line not found!')

f.write_text(''.join(lines), encoding='utf-8')
print('Done')
