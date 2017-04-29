<?php

$port = 80;
$url = 'http://'. file_get_contents('ip.txt') .':'. $port;
echo $url;