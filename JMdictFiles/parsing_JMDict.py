import xml.etree.ElementTree as ET

# Parse the XML file
tree = ET.parse('JMdict_e')
root = tree.getroot()

# Iterate over each <entry> element
for entry in root.findall('entry'):
    # Get the ent_seq value
    ent_seq = entry.find('ent_seq').text
    
    # Get the keb value (if available)
    keb_element = entry.find('.//keb')
    keb = keb_element.text if keb_element is not None else None
    
    # Get the reb value (if available)
    reb_element = entry.find('.//reb')
    reb = reb_element.text if reb_element is not None else None
    
    # Get the gloss value (if available)
    gloss_element = entry.find('.//gloss')
    gloss = gloss_element.text if gloss_element is not None else None
    
    # Print the extracted values
    print("ent_seq:", ent_seq)
    print("keb:", keb)
    print("reb:", reb)
    print("gloss:", gloss)
    print("-------------")
