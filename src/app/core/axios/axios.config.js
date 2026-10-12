"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
var axios_1 = require("axios");
var environment_1 = require("../../../environments/environment");
var TOKEN_KEY = 'bilanko_jwt_token';
exports.apiClient = axios_1.default.create({
    baseURL: environment_1.environment.baseApiUrl,
});
exports.apiClient.interceptors.request.use(function (config) {
    var token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
});
