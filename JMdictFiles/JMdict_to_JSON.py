import xml.etree.ElementTree as ET
import json
import re

# Regular expression pattern to match kanji characters
# [\u4e00-\u9faf] is a range for common kanji characters
kanji_pattern = re.compile(r'[\u4e00-\u9faf]')

# Parse the XML file
tree = ET.parse('JMdict_e')
root = tree.getroot()

# List to store extracted data
entries = []

# Iterate over each <entry> element
for entry in root.findall('entry'):
    # Initialize dictionary to store entry data
    entry_data = {}
    
    # Get the keb value (if available)
    keb_element = entry.find('.//keb')
    keb = keb_element.text if keb_element is not None else None
    # If keb is empty, omit the entry
    if not keb:
        continue
    # if keb is not using kanji, omit the entry
    keb = keb.strip()
    if not kanji_pattern.match(keb):
        continue
    
    entry_data['kanji'] = keb
    
    # Get the reb value (if available)
    reb_element = entry.find('.//reb')
    reb = reb_element.text if reb_element is not None else None
    entry_data['hiragana/katakana'] = reb
    
    # Get the gloss value (if available)
    gloss_element = entry.find('.//gloss')
    gloss = gloss_element.text if gloss_element is not None else None
    entry_data['glossary'] = gloss
    
    # Append entry data to list
    entries.append(entry_data)

# Write extracted data to a JSON file
with open('JMdict.json', 'w') as json_file:
    json.dump(entries, json_file, indent=4, ensure_ascii=False)

print("JSON file created successfully.")
