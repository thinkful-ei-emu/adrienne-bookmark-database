process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';

require('dotenv').config();

global.request = require('supertest');
global.expect = require('chai').expect;