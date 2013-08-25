
/**
 * Module dependencies.
 */

var url = require('url')
  , qs = require('querystring')

/**
 * Helpers method
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function helpers (name) {
  return function (req, res, next) {
    res.locals.appName = name || 'App'
    res.locals.title = name || 'App'
    res.locals.req = req
    res.locals.isActive = function (link) {
      return req.url.indexOf(link) !== -1 ? 'active' : ''
    }
    res.locals.formatDate = formatDate
    res.locals.formatDatetime = formatDatetime
    res.locals.stripScript = stripScript
    res.locals.createPagination = createPagination(req)

    if (typeof req.flash !== 'undefined') {
      res.locals.info = req.flash('info')
      res.locals.errors = req.flash('errors')
      res.locals.success = req.flash('success')
      res.locals.warning = req.flash('warning')
    }

    /**
     * Render mobile views
     *
     * If the request is coming from a mobile/tablet device, it will check if
     * there is a .mobile.ext file and it that exists it tries to render it.
     *
     * Refer https://github.com/madhums/nodejs-express-mongoose-demo/issues/39
     * For the implementation refer the above app
     */

    // For backward compatibility check if `app` param has been passed
    var ua = req.header('user-agent')
    var fs = require('fs')

    res._render = res.render
    req.isMobile = /mobile/i.test(ua)

    res.render = function (template, locals, cb) {
      var view = template + '.mobile.' + req.app.get('view engine')
      var file = req.app.get('views') + '/' + view

      if (/mobile/i.test(ua) && fs.existsSync(file)) {
        res._render(view, locals, cb)
      } else {
        res._render(template, locals, cb)
      }
    }

    next()
  }
}

module.exports = helpers

/**
 * Pagination helper
 *
 * @param {Number} pages
 * @param {Number} page
 * @return {String}
 * @api private
 */

function createPagination (req) {
  return function createPagination (pages, currentPage, maxDisplay) {
    currentPage = parseInt(currentPage)
    pages=Math.ceil(pages)
    var paginationLinkStr =function(page, text, params){
      params.page=page
      var clas = currentPage == page ? "active" : "no"
      return '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">'+text+'</a></li>'
    }
    var params = qs.parse(url.parse(req.url).query)
    var str = ''
    maxDisplay= maxDisplay===undefined ? 8 : maxDisplay

    // See the location of the current page.
    // if it is close to the first page by lesser than max-4 pages then show 1 to max-2 .. last-1, last
    // if it is close to the last page by lesser than max-4  pages then show 1,2 .. last-(max-2) to last
    // if neither.. then show 1,2 .. current-(max/2-1) to current+(max/2+1) .. last-1, last

    str += paginationLinkStr(0, 'First', params)

    if(pages>maxDisplay){
      if(currentPage < (maxDisplay - 4)){
        //case 1
        for (var pageNo = 1; pageNo <= (maxDisplay - 3); pageNo++) {
          str += paginationLinkStr(pageNo, pageNo, params)
        }
        str += paginationLinkStr(pages-2, pages-2, params)
        str += paginationLinkStr(pages-1, pages-1, params)
      }else if ((pages - currentPage) < (maxDisplay - 4)){
        //case 2
        str += paginationLinkStr(1, 1, params)
        for (var pageNo = (pages - maxDisplay + 2); pageNo < pages; pageNo++) {
          str += paginationLinkStr(pageNo, pageNo, params)
        }
      }else{
        //case 3
        str += paginationLinkStr(1, 1, params)
        var max=currentPage + maxDisplay/2 - 2
        for (var pageNo = currentPage - (maxDisplay / 2 - 2); pageNo <=max ; pageNo++) {
          str += paginationLinkStr(pageNo, pageNo, params)
        }
        str += paginationLinkStr(pages-2, pages-2, params)
        str += paginationLinkStr(pages-1, pages-1, params)
      }

    }else{
      //render all page links!!

      for (var pageNo = 1; pageNo < pages; pageNo++) {
        str += paginationLinkStr(pageNo, pageNo, params)
      }
    }
    str += paginationLinkStr(--pages, 'Last', params)
    return str
  }
}

/**
 * Format date helper
 *
 * @param {Date} date
 * @return {String}
 * @api private
 */

function formatDate (date) {
  var monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
  return monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()
}

/**
 * Format date time helper
 *
 * @param {Date} date
 * @return {String}
 * @api private
 */

function formatDatetime (date) {
  var hour = date.getHours();
  var minutes = date.getMinutes() < 10
    ? '0' + date.getMinutes().toString()
    : date.getMinutes();

  return formatDate(date) + ' ' + hour + ':' + minutes;
}

/**
 * Strip script tags
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function stripScript (str) {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
