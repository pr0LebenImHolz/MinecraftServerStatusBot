#!/bin/bash
# Grabs and kill a process from the pidlist that has the word StartService

kill $(ps aux | grep lih-serverstatusbot | grep -v grep | awk '{print $2}')
