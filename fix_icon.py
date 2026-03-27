import pathlib

p = pathlib.Path(r'C:\Users\torit\.gemini\antigravity\scratch\paypay-collect-vercel\public\index.html')
t = p.read_text(encoding='utf-8')

old = '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
new = '''<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" href="/icon-512.png">
    <link rel="apple-touch-icon" href="/icon-512.png">
    <meta name="apple-mobile-web-app-title" content="\u96c6\u91d1\u30c1\u30a7\u30c3\u30ab\u30fc">'''

t = t.replace(old, new)
p.write_text(t, encoding='utf-8')
print('OK')
