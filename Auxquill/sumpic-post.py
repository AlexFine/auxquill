import requests
import sys
fp = sys.argv[1]

url = 'http://quillapp.io/cgi-bin/sumpic.py'
files = {'file': open(fp, 'rb')}
r = requests.post(url, files=files)

print r.text


