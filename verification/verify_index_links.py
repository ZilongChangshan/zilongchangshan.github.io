from html.parser import HTMLParser

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.found_nongchang = False

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            href = dict(attrs).get('href')
            if href == './nongchang/':
                self.found_nongchang = True

parser = LinkParser()
with open('index.html', 'r') as f:
    parser.feed(f.read())

if parser.found_nongchang:
    print("PASS: Found link to ./nongchang/")
else:
    print("FAIL: Link to ./nongchang/ not found")
