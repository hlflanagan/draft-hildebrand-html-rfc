DRAFT=draft-hildebrand-html-rfc
#XMLJADE=../xmljade/bin/xmljade
XMLJADE=xmljade

%.3.xml: %.xml convertv2v3/convertv2v3
	perl convertv2v3/convertv2v3  < $< > $@

%.n.xml: %.3.xml number.jade number.js
	$(XMLJADE) --pretty --output $@ number.jade $<

%.3.html: %.n.xml v3tohtml.jade v3.js xml2rfc.css
	$(XMLJADE) --pretty --html --output $@ v3tohtml.jade $<

%.txt: %.xml
	xml2rfc --text --html $<

.PRECIOUS: %.3.xml %.n.xml

all: $(DRAFT).3.html $(DRAFT).txt test.3.html

clean:
	$(RM) $(DRAFT).html $(DRAFT).3.html $(DRAFT).3.xml $(DRAFT).n.xml $(DRAFT).txt test.3.html test.n.xml
