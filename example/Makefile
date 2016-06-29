NODE_BIN=node_modules/.bin
PREP=$(NODE_BIN)/rfc-preptool
XMLJADE=$(NODE_BIN)/xmljade
PRINCE=$(shell which prince 2> /dev/null)
WK=wkhtmltopdf
XMLLINT=xmllint
PYTHON=python3
HTTPSERVER=node_modules/.bin/http-server
LOCALHOST_DIR=localhost
SRC=$(wildcard *.xml)
ALL_HTML=$(SRC:%.xml=out/%.html)
ALL_WK=$(SRC:%.xml=out/%.$(WK).a.pdf)
ALL_PRINCE=$(SRC:%.xml=out/%.prince.a.pdf)

.PHONY: start stop clean html pdf all
.PRECIOUS: out/%.xml

out/%.xml: %.xml
	$(PREP) $< $@

out/%.html: out/%.xml v3tohtml.jade lib.jade v3.js
	$(XMLJADE) --pretty --html --doublequote --output $@ v3tohtml.jade $<

out/%.$(WK).pdf: out/%.html out/xml2rfc.css out/local.css
	@if [ -z "$(WK)" ]; then \
	  echo "Download wkhtmltopdf from http://wkhtmltopdf.org/downloads.html"; \
		exit 1; \
	fi
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

out/%.$(WK).a.pdf: out/%.$(WK).pdf PDFappendXML.py
	$(PYTHON) PDFappendXML.py $< $(word 2,$^) $@

out/%.prince.pdf: out/%.html out/xml2rfc.css out/local.css
	@if [ -z "$(PRINCE)" ]; then \
	  echo "Download prince from http://www.princexml.com/download/"; \
		exit 1; \
	fi
	$(PRINCE) -o $@ $<

out/%.prince.a.pdf: out/%.prince.pdf PDFappendXML.py
	python3 PDFappendXML.py $< $(word 2,$^) $@

all: html pdf

html: start
	$(MAKE) real-html; $(MAKE) stop

real-html: $(ALL_HTML)

pdf: $(ALL_WK) $(ALL_PRINCE)

clean:
	$(RM) out/*.pdf out/*.html out/*.xml

start: server.PID

server.PID:
	$(HTTPSERVER) $(LOCALHOST_DIR) & echo $$! > $@;
	@echo '`make stop` to stop the server'

stop:
	@if [ -a server.PID ]; then \
	  echo 'Stopping'; \
	  pkill -F server.PID; \
	  $(RM) server.PID; \
	else \
	  echo 'Not running'; \
	fi
