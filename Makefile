DRAFT=draft-hildebrand-html-rfc
XMLJADE=../xmljade/bin/xmljade

%.3.xml: %.xml convertv2v3/convertv2v3
	perl convertv2v3/convertv2v3  < $< > $@

%.n.xml: %.3.xml number.jade
	$(XMLJADE) number.jade $< -o $@

%.html: %.n.xml v3tohtml.jade
	$(XMLJADE) v3tohtml.jade $< | js-beautify --type html -s 2  -w 70 -n -f - > $@

.PRECIOUS: %.3.xml %.n.xml

all: $(DRAFT).html test.html

clean:
	$(RM) $(DRAFT).html $(DRAFT).3.xml $(DRAFT).n.xml test.html test.n.xml
