'use strict';
const config = require('config');
const {assert} = require('chai');
const {buildQuery, buildSortBy, buildPageLink} = require('../../helpers/QueryParamsAndPaginationHelper');
const baseURL = `${config.get('BASE_URL')}:${config.get('APP_PORT')}`;

/**
 * @TestSuite Query params and pagination helper module
 * @description - Test the build query, build sortby, build page link functionality
 *
 * @author Mohit Nagori <nagorimohit21@gmail.com>
 * @since 20-July-2019
 */
describe('QueryParamsAndPaginationHelper Module:- Test Scenarios', () => {

  /**
   * @TestSuite buildQuery method
   * @description - Test the query object build functionality for query params
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('buildQuery() Method:- Test Scenarios', () => {
    it('Test the scenario when buildQuery successfully from incoming request query params', () => {
      const swaggerParams = {
        first_name: {
          value: 'someName',
          schema: {
            name: 'first_name',
            in: 'query'
          }
        },
        page: {
          value: 1,
          schema: {
            name: 'page',
            in: 'query'
          }
        }
      };
      const expectedQueryObj = {
        first_name: 'someName'
      };
      const query = buildQuery(swaggerParams);
      assert.deepEqual(
        query,
        expectedQueryObj,
        'Expected build query object does not match'
      );
    });
  });

  /**
   * @TestSuite buildSortBy method
   * @description - Test the sort by object build functionality for query params
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('buildQuery() Method:- Test Scenarios', () => {
    it('Test the scenario when build sort params successfully from incoming request query params with default name',
      () => {
        const swaggerParams = {
          sortBy: {
            value: ['first_name', '-last_name'],
            schema: {
              name: 'sortBy',
              in: 'query'
            }
          }
        };
        const expectedSortByObj = {
          first_name: 1,
          last_name: -1
        };
        const sortByObj = buildSortBy(swaggerParams);
        assert.deepEqual(
          sortByObj,
          expectedSortByObj,
          'Expected build sort by object does not match'
        );
      });

    it('Test the scenario when build sort params successfully from incoming request query params with custom name',
      () => {
        const swaggerParams = {
          sortParam: {
            value: ['first_name', '-last_name'],
            schema: {
              name: 'sortParam',
              in: 'query'
            }
          }
        };
        const expectedSortByObj = {
          first_name: 1,
          last_name: -1
        };
        const sortByObj = buildSortBy(swaggerParams, 'sortParam');
        assert.deepEqual(
          sortByObj,
          expectedSortByObj,
          'Expected build sort by object does not match'
        );
      });
  });

  /**
   * @TestSuite buildPageLink method
   * @description - Test the page link build functionality
   *
   * @author Mohit Nagori <nagorimohit21@gmail.com>
   * @since 20-July-2019
   */
  describe('buildPageLink() Method:- Test Scenarios', () => {

    it('Test the scenario when only single page exist', () => {
      const page = 1;
      const itemsPerPage = 20;
      const recordsCount = 15;
      const url = `/api/user?page=${page}&itemsPerPage=${itemsPerPage}`;
      const expectedPageLink = {
        first: `${baseURL}${url}`,
        last: `${baseURL}${url}`
      };
      const pageLink = JSON.parse(buildPageLink(url, page, itemsPerPage, recordsCount));
      assert.deepEqual(
        pageLink,
        expectedPageLink,
        'Expected page link object does not match'
      );
    });

    it('Test the scenario when only next page available and that\'s last one too and not a previous page exist', () => {
      const page = 1;
      const itemsPerPage = 20;
      const recordsCount = 25;
      const url = `/api/user?page=${page}&itemsPerPage=${itemsPerPage}`;
      const expectedPageLink = {
        first: `${baseURL}${url}`,
        last: `${baseURL}/api/user?page=${page + 1}&itemsPerPage=${itemsPerPage}`,
        next: `${baseURL}/api/user?page=${page + 1}&itemsPerPage=${itemsPerPage}`
      };
      const pageLink = JSON.parse(buildPageLink(url, page, itemsPerPage, recordsCount));
      assert.deepEqual(
        pageLink,
        expectedPageLink,
        'Expected page link object does not match'
      );
    });

    it('Test the scenario when previous page available but not a next page exist', () => {
      const page = 2;
      const itemsPerPage = 20;
      const recordsCount = 25;
      const url = `/api/user?page=${page}&itemsPerPage=${itemsPerPage}`;
      const expectedPageLink = {
        first: `${baseURL}/api/user?page=${page - 1}&itemsPerPage=${itemsPerPage}`,
        last: `${baseURL}${url}`,
        prev: `${baseURL}/api/user?page=${page - 1}&itemsPerPage=${itemsPerPage}`
      };
      const pageLink = JSON.parse(buildPageLink(url, page, itemsPerPage, recordsCount));
      assert.deepEqual(
        pageLink,
        expectedPageLink,
        'Expected page link object does not match'
      );
    });

    it('Test the scenario when all page available and next page is last page', () => {
      const page = 2;
      const itemsPerPage = 20;
      const recordsCount = 50;
      const url = `/api/user?page=${page}&itemsPerPage=${itemsPerPage}`;
      const expectedPageLink = {
        first: `${baseURL}/api/user?page=${page - 1}&itemsPerPage=${itemsPerPage}`,
        last: `${baseURL}/api/user?page=${page + 1}&itemsPerPage=${itemsPerPage}`,
        prev: `${baseURL}/api/user?page=${page - 1}&itemsPerPage=${itemsPerPage}`,
        next: `${baseURL}/api/user?page=${page + 1}&itemsPerPage=${itemsPerPage}`
      };
      const pageLink = JSON.parse(buildPageLink(url, page, itemsPerPage, recordsCount));
      assert.deepEqual(
        pageLink,
        expectedPageLink,
        'Expected page link object does not match'
      );
    });

    it('Test the scenario when all page available but next page is not a last page', () => {
      const page = 2;
      const itemsPerPage = 20;
      const recordsCount = 70;
      const url = `/api/user?page=${page}&itemsPerPage=${itemsPerPage}`;
      const expectedPageLink = {
        first: `${baseURL}/api/user?page=${page - 1}&itemsPerPage=${itemsPerPage}`,
        last: `${baseURL}/api/user?page=${page + 2}&itemsPerPage=${itemsPerPage}`,
        prev: `${baseURL}/api/user?page=${page - 1}&itemsPerPage=${itemsPerPage}`,
        next: `${baseURL}/api/user?page=${page + 1}&itemsPerPage=${itemsPerPage}`
      };
      const pageLink = JSON.parse(buildPageLink(url, page, itemsPerPage, recordsCount));
      assert.deepEqual(
        pageLink,
        expectedPageLink,
        'Expected page link object does not match'
      );
    });
  });
});