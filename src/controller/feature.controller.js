const Feature = require("../model/index").Feature;
const ResponseModel = require('../util/response-model');
const Message = require('../util/message/en');
const Handler = require('./handling-helper');
const VerifyUtils = require('../util/verify-request');
const MessageHelper = require('../util/message/message-helper');

const FeatureController = {};

FeatureController.getAll=getAll;
FeatureController.getFeatureByProperty=getFeatureByProperty;
FeatureController.create = create;
FeatureController.update = update;
FeatureController.destroy = destroy;

module.exports = FeatureController;


function getAll(req,res){
    VerifyUtils
    .verifyPublicRequest(req)
    .then(data=>{
        if(data){
            Feature.findAll({
                order: [
                    ['name', 'ASC']
                ]
            })
            .then(result=>{
                res.status(200).json(new ResponseModel({
                    code: 200,
                    status_text: 'OK',
                    success: true,
                    data: result,
                    errors: null
                }));
            })
            .catch(error=>{
                handlingCanotGetAllFeature(req,res);
            });
        }else{
            errorVerifyApiKey(req,res);
        }
    })
    .catch(error=>{
        Handler.invalidAccessToken(req, res);
    });
}

function getFeatureByProperty(req,res){
    VerifyUtils
    .verifyPublicRequest(req)
    .then(data=>{
        if(data){
            let property_id=req.query.property_id;
            Feature.findAll({ where: { property_id: property_id },
                order: [
                    ['name', 'ASC']
                ]
            })
            .then(result=>{
                res.status(200).json(new ResponseModel({
                    code: 200,
                    status_text: 'OK',
                    success: true,
                    data: result,
                    errors: null
                }));
            })
            .catch(error=>{
                handlingCanotGetFeatureByProperty(req,res);
            });
        }else{
            errorVerifyApiKey(req,res);
        }
    })
    .catch(error=>{
        Handler.invalidAccessToken(req, res);
    });
}

function create(req, res) {
    VerifyUtils
        .verifyProtectRequest(req)
        .then(data => {
            if (data.user.role != 'admin') {
                Handler.unAuthorizedAdminRole(req, res);
                return;
            }
            let feature = req.body;
            Feature.create(feature)
                .then(data => {
                    res.status(200).json(new ResponseModel({
                        code: 200,
                        status_text: 'OK',
                        success: true,
                        data: data,
                        errors: null
                    }));
                })
                .catch(error => {
                    handlingCannotCreateFeature(req, res);
                })
        })
        .catch(error => {
            Handler.invalidAccessToken(req, res);
        });
}
function update(req, res) {
    VerifyUtils
        .verifyProtectRequest(req)
        .then(data => {
            if (data.user.role != 'admin') {
                Handler.unAuthorizedAdminRole(req, res);
                return;
            }
            let feature = req.body;
            let feature_id = req.body.id;
            Feature.update(feature, { where: { id: feature_id } })
                .then(data => {
                    res.status(200).json(new ResponseModel({
                        code: 200,
                        status_text: 'OK',
                        success: true,
                        data: data,
                        errors: null
                    }));
                })
                .catch(error => {
                    handlingCannotUpdateFeature(req, res);
                });

        })
        .catch(error => {
            Handler.invalidAccessToken(req, res);
        });
}

function destroy(req, res) {
    VerifyUtils
        .verifyProtectRequest(req)
        .then(data => {
            if (data.user.role != 'admin') {
                Handler.unAuthorizedAdminRole(req, res);
                return;
            }
            let feature_id = req.query.id;
            Feature.destroy({
                where: { id: feature_id }
            })
                .then(data => {
                    res.status(200).json(new ResponseModel({
                        code: 200,
                        status_text: 'OK',
                        success: true,
                        data: data,
                        errors: null
                    }));
                })
                .catch(error => {
                    handlingCannotDestroyFeature(req, res);
                });
        })
        .catch(error => {
            Hander.invalidAccessToken(req, res);
        });
}
function handlingCanotGetAllFeature(req,res){
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_get_feature')]
    }));
}
function handlingCannotCreateFeature(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_create_feature')]
    }));
}
function handlingCannotUpdateFeature(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_update_feature')]
    }));
}
function handlingCannotDestroyFeature(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_delete_feature')]
    }));
}
function handlingCanotGetFeatureByProperty(req,res){
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_get_feature_by_property')]
    }));
}
function errorVerifyApiKey(req,res){
    res.status(505).json(new ResponseModel({
        code: 505,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'invalid_api_key')]
    }));
}
function getMessage(req, errorMessage) {
    return MessageHelper.getMessage(req.query.lang || 'vi', errorMessage);
}