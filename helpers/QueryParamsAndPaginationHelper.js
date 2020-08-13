'use strict';
const _ = require('lodash');
const config = require('config');
const baseURL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;

/**
 * @module QueryParams-And-Pagination-Helper
 * @description - Query params and pagination helper
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
module.exports = {
  /**
   * @method buildQuery
   * @description - Provide query object from swagger params
   *
   * @param {Object} swaggerParams - The swagger params of request
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {object} - return the query object
   */
  buildQuery: (swaggerParams) => {
    let queryObj = {};
    _.forOwn(swaggerParams, (param) => {
      const paramName = _.get(param, 'schema.name');
      if (
        !_.isEmpty(param.value) &&
        param.schema.in === 'query' &&
         !['sortBy', 'page', 'itemsPerPage'].includes(paramName)
      ) {
        queryObj[paramName] = param.value;
      }
    });
    return queryObj;
  },

  /**
   * @method buildSortBy
   * @description - Provide sorting object from swagger params.
   * @note:- if no sortParamName pass then go for a `sortBy` name in swagger params schemas for sorting fields
   *
   * @param {Object} swaggerParams - The swagger params of request
   * @param {string} sortParamName - The sorting param name.
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {object} - return the query object
   */
  buildSortBy: (swaggerParams, sortParamName = 'sortBy') => {
    let sortObj = {};
    _.forEach(swaggerParams, (param) => {
      if (!_.isEmpty(param.value) &&
        (param.schema.name === 'sortBy' || param.schema.name === sortParamName)) {
        _.forEach(param.value, (field) => {
          if (field.startsWith('-')) {
            sortObj[field.substring(1)] = -1;
          } else {
            sortObj[field] = 1;
          }
        });
      }
    });
    return sortObj;
  },

  /**
   * @method buildPageLink
   * @description - Provide pages link header string from passed parameters.
   *
   * @param {String} route - The route that used
   * @param {integer} page - The page number
   * @param {integer} itemsPerPage - The records per page
   * @param {integer} resultCount - The db record counts
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   *
   * @returns {string} - return the pagination link
   */
  buildPageLink: (route, page, itemsPerPage, resultCount) => {
    let url = baseURL + route;
    let pageRegex = new RegExp(_getRegexForFetchQueryString('page'));
    let itemsPerPageRegex = new RegExp(_getRegexForFetchQueryString('itemsPerPage'));
    let lastPage = Math.ceil(resultCount/itemsPerPage);
    lastPage = (lastPage === 0) ? 1 : lastPage;
    let paginationLink = {
      first: _preparePaginationObjectLink(url, pageRegex, 1, itemsPerPageRegex, itemsPerPage),
      last: _preparePaginationObjectLink(url, pageRegex, lastPage, itemsPerPageRegex, itemsPerPage)
    };
    if (page !== 1 && lastPage !== 1) {
      if (page !== lastPage) {
        paginationLink['next'] =
          _preparePaginationObjectLink(url, pageRegex, page + 1, itemsPerPageRegex, itemsPerPage);
        paginationLink['prev'] =
          _preparePaginationObjectLink(url, pageRegex, page - 1, itemsPerPageRegex, itemsPerPage);
      } else {
        paginationLink['prev'] =
          _preparePaginationObjectLink(url, pageRegex, page - 1, itemsPerPageRegex, itemsPerPage);
      }
    } else {
      if (page !== lastPage && lastPage !== 1) {
        paginationLink['next'] =
          _preparePaginationObjectLink(url, pageRegex, page + 1, itemsPerPageRegex, itemsPerPage);
      }
    }
    return JSON.stringify(paginationLink);
  }
};

/**
 * @function _getRegexForFetchQueryString
 * @description - Return the regex for retrieve the query string value
 *
 * @param {string} forItem - The query string field
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @private
 * @return {string}
 */
function _getRegexForFetchQueryString(forItem) {
  return `(?<=${forItem}=)(\\w+)(?=[&\\s])`;
}

/**
 * @function _preparePaginationObjectLink
 * @description - Return pagination object link
 *
 * @param {string} url - The url string
 * @param {RegExp} pageRegex - The replace page regex
 * @param {string} page - The page number
 * @param {RegExp} itemsPerPageRegex - The replace item per page regex
 * @param {string} itemsPerPage - The itemsPerPage count
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 *
 * @private
 * @return {string}
 */
function _preparePaginationObjectLink(url, pageRegex, page, itemsPerPageRegex, itemsPerPage) {
  return url.replace(pageRegex, page).replace(itemsPerPageRegex, itemsPerPage);
}