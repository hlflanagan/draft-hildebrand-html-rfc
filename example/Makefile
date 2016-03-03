XMLJADE=node_modules/.bin/xmljade
XMLLINT=xmllint
PRINCE=prince
WK=wkhtmltopdf
HTTPSERVER=node_modules/.bin/http-server
LOCALHOST_DIR=localhost
RNG=draft-iab-xml2rfc/xml2rfcv3.rng

.PHONY: start stop clean lint
.PRECIOUS: %.3.xml %.n.xml %.x.xml %.i.xml %.3.pdf %.3w.pdf

%.3.xml: %.xml convertv2v3/convertv2v3
	perl convertv2v3/convertv2v3  < $< > $@

%.i.xml: %.3.xml server.PID
	$(XMLLINT) --xinclude --noent $< -o $@

%.n.xml: %.i.xml prep1.jade lib.jade number.js
	$(XMLJADE) --pretty --output $@ prep1.jade $<

%.x.xml: %.n.xml prep2.jade lib.jade xref.js
	$(XMLJADE) --pretty --output $@ prep2.jade $<

%.3.html: %.x.xml v3tohtml.jade lib.jade v3.js dt.js xml2rfc.css
	$(XMLJADE) --pretty --html --doublequote --output $@ v3tohtml.jade $<

%.3w.pdf:%.3.html xml2rfc.css local.css
	$(WK) \
	  -q \
	  --encoding utf8 \
	  --header-left   "$(shell $(XMLLINT) --html --xpath '//thead/tr/td[@class="left"]/text()'   $< 2>/dev/null)" \
	  --header-center "$(shell $(XMLLINT) --html --xpath '//thead/tr/td[@class="center"]/text()' $< 2>/dev/null)" \
	  --header-right  "$(shell $(XMLLINT) --html --xpath '//thead/tr/td[@class="right"]/text()'  $< 2>/dev/null)" \
	  --header-line \
	  --footer-left   "$(shell $(XMLLINT) --html --xpath '//tfoot/tr/td[@class="left"]/text()'   $< 2>/dev/null)" \
	  --footer-center "$(shell $(XMLLINT) --html --xpath '//tfoot/tr/td[@class="center"]/text()' $< 2>/dev/null)" \
	  --footer-right  "[Page [page]]" \
	  --footer-line \
	  --margin-bottom 45mm \
	  $< \
	  $@

%.3wa.pdf: %.3w.pdf %.x.xml PDFappendXML.py
	python3 PDFappendXML.py $< $(word 2,$^) $@

%.3.pdf: %.3.html xml2rfc.css local.css
	$(PRINCE) -o $@ $<

%.3a.pdf: %.3.pdf %.x.xml PDFappendXML.py
	python3 PDFappendXML.py $< $(word 2,$^) $@

all: test.3.html test.3a.pdf test.3wa.pdf

clean:
	$(RM) test.3.html test.3.pdf test.3a.pdf test.3w.pdf test.3wa.pdf test.i.xml test.n.xml test.x.xml

lint: server.PID
	xmllint --noout --noent --xinclude --relaxng $(RNG) *.3.xml *.n.xml *.x.xml

start: server.PID

server.PID:
	$(HTTPSERVER) $(LOCALHOST_DIR) & echo $$! > $@;
	@echo '`make stop` to stop the server'

stop:
	@if [ -a server.PID ]; then echo 'Stopping'; kill `cat server.PID`; rm server.PID; else echo 'Not running'; fi;
