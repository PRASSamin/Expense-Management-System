import re
from urllib.parse import urlparse
# import requests
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv
import os
import xml.etree.ElementTree as ET
import json

load_dotenv()


def uidGen(username):
    firstFilter = str(uuid.uuid4()).replace('-', '')
    secondFilter = '-'.join([firstFilter[i:i+5] for i in range(0, len(firstFilter), 5)])
    thirdFilterRemoveNot5CharacterGroup = [group for group in secondFilter.split('-') if len(group) == 5]
    
    joinWithHyphens = '-'.join(thirdFilterRemoveNot5CharacterGroup)
    fourthFilterWithHyphens = f"{username}-{joinWithHyphens}"
    
    return fourthFilterWithHyphens