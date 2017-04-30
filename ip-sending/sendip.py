from pyroute2 import IPDB
import time
from urllib2 import urlopen
import time
import requests

ip = IPDB()


def send(ip_collection):
    print "sending ip"
    key = 'ravem-drone'
    url = 'http://manodarbai.eu/drone/set.php?key={}&pip={}&ip={}'.format(key, ip_collection[0], ip_collection[1])
    urlopen(url)


def is_connected():
    try:
        state = ip.interfaces.wlan0.ipaddr[0]["address"]
        print "Private ip is", state
        return [True, state]
    except:
        print "Wifi is not connected..."
        return [False, None]


def check_public_ip():
    try:
        my_ip = urlopen('http://ip.42.pl/raw').read()
        return my_ip
    except:
        print "Can't fetch public ip"
        return None


def ip_change():
    while True:
        time.sleep(3)
        inner_ip = is_connected()
        if inner_ip[0]:
            ip_temp = check_public_ip()
            if not ip_temp == None:
                print "Returning ip"
                return [ip_temp, inner_ip[1]]


def run():
    ip_collection = ip_change()
    send(ip_collection)
    counter = 0
    while True:
        if not is_connected()[0]:
            ip_collection = ip_change()
            print "public ip:", ip_collection[0]
            send(ip_collection)
        counter += 1
        if counter == 2:
            counter = 0
            temp_ip = ip_change()
            if not temp_ip[0] == ip_collection[0]:
                ip_collection = temp_ip
                send(ip_collection)
        time.sleep(5)


run()

ip.release()
