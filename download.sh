#!/bin/bash

# download JMdict_e.gz
# extract JMdict_e.gz
# delete JMdict_e.gz

curl --get ftp://ftp.edrdg.org/pub/Nihongo//JMdict_e.gz > JMdict_e.gz
gzip -d JMdict_e.gz