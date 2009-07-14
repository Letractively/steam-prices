import wsgiref.handlers
import cgi
import re
import urllib
from google.appengine.ext import webapp
from google.appengine.api import urlfetch
from google.appengine.api import memcache

class MainHandler(webapp.RequestHandler):

  def get(self):
    fromcurrency = cgi.escape(self.request.get('from'))
    tocurrency = cgi.escape(self.request.get('to'))
    #amount = cgi.escape(self.request.get('a'))
    
    exchangerate = get_exchangerate(fromcurrency, tocurrency)

    if exchangerate is None:
      self.response.headers['Content-Type'] = 'application/javascript'
      self.response.out.write("function "+fromcurrency+"to"+tocurrency+"(a) {\n")
      self.response.out.write("  return None;\n")
      self.response.out.write("}\n")
    else:
      self.response.headers['Content-Type'] = 'application/javascript'
      self.response.out.write("function "+fromcurrency+"to"+tocurrency+"(a) {\n")
      self.response.out.write("  return a*"+exchangerate+";\n")
      self.response.out.write("}\n")

def get_exchangerate(a, b):
  #Get exchange rate from memcache
  exchangerate = memcache.get(a+"-"+b)
  if exchangerate is not None:
    return exchangerate
  else:
    #It's not in memcache, so download it instead
    url = "http://www.google.com/finance/converter"
    data = {
      "a": "1",
      "from": a,
      "to": b
    }
    encoded_data = urllib.urlencode(data)
    result = urlfetch.fetch(url+"?"+encoded_data)
    
    if result.status_code != 200:
      return None

    #Search for the relevant string
    regex = re.compile('class=bld>([\d\.]+)\s', re.IGNORECASE)
    match = regex.search(result.content)
    if not match:
      return None
    
    #success! store it in memcache and return
    memcache.add(a+"-"+b, match.group(1), 3600)
    return match.group(1)

def main():
  application = webapp.WSGIApplication([('/', MainHandler)], debug=True)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()
