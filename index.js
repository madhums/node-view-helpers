
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
    res.locals.stripScript = stripScript
    res.locals.createPagination = createPagination(req)

    if (typeof req.flash !== 'undefined') {
      res.locals.info = req.flash('info')
      res.locals.errors = req.flash('errors')
      res.locals.success = req.flash('success')
      res.locals.warning = req.flash('warning')
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
  return function createPagination (pages, page) {
    var params = qs.parse(url.parse(req.url).query)
    var str = ''

    params.page = 0
    var clas = page == 0 ? "active" : "no"
    str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">First</a></li>'
    for (var p = 1; p < pages; p++) {
      params.page = p
      clas = page == p ? "active" : "no"
      str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">'+ p +'</a></li>'
    }
    params.page = --p
    clas = page == params.page ? "active" : "no"
    str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">Last</a></li>'

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
 * Strip script tags
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function stripScript (str) {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
