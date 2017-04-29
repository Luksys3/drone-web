#!/usr/bin/python
import time
import urllib2
import requests

def send():
    key = 'ravem-drone'
    url = 'http://manodarbai.eu/drone/set.php?key='+ key
    urllib2.urlopen( url );

while True:
    try:
        urllib2.urlopen("http://www.google.com").close()
    except urllib2.URLError:
        print "Not Connected"
        time.sleep(1)
    else:
        print "Connected"
        send()
        break