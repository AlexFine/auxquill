#!/usr/bin/python

import cgi
import cgitb; cgitb.enable()
import base64
import getopt
import MultipartPostHandler
import os
import re
import json
import sys
import time
import urllib2
import urllib
from AbbyyOnlineSdk import *
import pyteaser

"""<html><body>
<form enctype="multipart/form-data" action="cgi-bin/cgiscript.py" method="post">
<p>File: <input type="file" name="file"></p>
<p><input type="submit" value="Upload"></p>
</form>
</body></html>"""

form = cgi.FieldStorage()
fileitem = form['file']
if fileitem.filename:
    fn = os.path.basename(fileitem.filename)
    fp = 'files/' + fn
    open(fp, 'wb').write(fileitem.file.read())
else:
    exit(0)

processor = AbbyyOnlineSdk()

outputFormat = 'txt'
language = 'English'
filePath = fp

settings = ProcessingSettings()
settings.Language = language
settings.OutputFormat = outputFormat
task = processor.ProcessImage(filePath, settings)
if task == None:
    exit(0)

while task.IsActive() == True :
    time.sleep(2)
    task = processor.GetTaskStatus(task)

if task.Status == "Completed":
    if task.DownloadUrl != None:
        text = processor.GetResult(task)
else:
    exit(0)

text = unicode(text, 'utf-8')
summary = pyteaser.Summarize('', text)
obj = {}
obj['filename'] = fn
obj['time'] = int(time.time() * 1000)
obj['sentences'] = [x.encode('utf-8') for x in summary]

print 'Content-type: application/json; charset=utf-8\r\n'
print json.dumps(obj)

