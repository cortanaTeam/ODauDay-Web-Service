const Property = require("../model/index").Property;
const Tag = require("../model/index").Tag;
const Category = require("../model/index").Category;
const Feature = require("../model/index").Feature;
const Type = require("../model/index").Type;
const Email = require("../model/index").Email;
const Phone = require("../model/index").Phone;
const Image = require("../model/index").Image;
const PropertyTag = require("../model/index").PropertyTag;
const PropertyCategory = require("../model/index").PropertyCategory;
const PropertyType = require("../model/index").PropertyType;

const ResponseModel = require('../util/response-model');
const Message = require('../util/message/en');
const Handler = require('./handling-helper');
const VerifyUtils = require('../util/verify-request');
const MessageHelper = require('../util/message/message-helper');
const EmailController = require("./email.controller");
const PropertyController = {};

PropertyController.getAll = getAll;
PropertyController.getPropertyByUser = getPropertyByUser;
PropertyController.create = create;
PropertyController.update = update;
PropertyController.destroy = destroy;

module.exports = PropertyController;

async function getAll(req, res) {
    try {
        let verify = await VerifyUtils.verifyPublicRequest(req);

        let data = await Property.findAll({
            include: getModels()
        });

        responseData(res, data);
    } catch (error) {
        if (error.constructor.name === 'ConnectionRefusedError') {
            Handler.cannotConnectDatabase(req, res);
        } else if (error.constructor.name === 'ValidationError' ||
            error.constructor.name === 'UniqueConstraintError') {
            Handler.validateError(req, res, error);
        } else if (error.constructor.name == 'ErrorModel') {
            Handler.handlingErrorModel(res, error);
        } else {
            handlingCanotGetAllProperty(req, res);
        }
    }
}

async function getPropertyByUser(req, res) {
    try {
        let verify = await VerifyUtils.verifyProtectRequest(req);
        let user_id = req.query.user_id;
        let data = await Property.findAll({
            include: getModels(), where: { user_id_created: user_id }
        });

        responseData(res, data);

    } catch (error) {
        if (error.constructor.name === 'ConnectionRefusedError') {
            Handler.cannotConnectDatabase(req, res);
        } else if (error.constructor.name === 'ValidationError' ||
            error.constructor.name === 'UniqueConstraintError') {
            Handler.validateError(req, res, error);
        } else if (error.constructor.name == 'ErrorModel') {
            Handler.handlingErrorModel(res, error);
        } else {
            handlingCanotGetPropertyByUser(req, res);
        }
    }
}

async function create(req, res) {
    try {
        let verify = await VerifyUtils.verifyProtectRequest(req);
        let property = req.body;

        let data = await Property.create(property);

        let features = getFeatureSetPropertyId(req.body.Features, data.id);
        let result_feature = await Feature.bulkCreate(features);

        let emails = getEmailSetPropertyId(req.body.Emails, data.id);
        let result_email = await Email.bulkCreate(emails);

        let phones = getPhoneSetPropertyId(req.body.Phones, data.id);
        let result_phone = await Phone.bulkCreate(phones);

        let images = getImageSetPropertyId(req.body.Images, data.id);
        let result_image = await Image.bulkCreate(images);


        //tag, category, type {id,name}

        let property_tags = getPropertyTag(req.body.tags, data.id);
        let result_property_tag = await PropertyTag.bulkCreate(property_tags);

        let property_categorys = getPropertyCategory(req.body.categorys, data.id);
        let result_property_category = await PropertyCategory.bulkCreate(property_categorys);

        let property_types = getPropertyType(req.body.types, data.id);
        let result_property_type = await PropertyType.bulkCreate(property_types);


        responseData(res, MessageHelper.getMessage(req.query.lang || 'vi', "create_property_success"));
    } catch (error) {
        if (error.constructor.name === 'ConnectionRefusedError') {
            Handler.cannotConnectDatabase(req, res);
        } else if (error.constructor.name === 'ValidationError' ||
            error.constructor.name === 'UniqueConstraintError') {
            Handler.validateError(req, res, error);
        } else if (error.constructor.name == 'ErrorModel') {
            Handler.handlingErrorModel(res, error);
        } else {
            handlingCannotCreateProperty(req, res);
        }
    }
}
async function update(req, res) {
    try {
        let verify = await VerifyUtils.verifyProtectRequest(req);
        let property = req.body;
        let property_id = req.body.id;

        let data = await Property.update(property, { where: { id: property_id } });
        //feature, email, phone, image
        let delete_feature_old = await Feature.destroy({ where: { property_id: property_id } });
        let features = getFeatureSetPropertyId(req.body.Features, property_id);
        let result_feature = await Feature.bulkCreate(features);

        let delete_email_old = await Email.destroy({ where: { property_id: property_id } });
        let emails = getEmailSetPropertyId(req.body.Emails, property_id);
        let result_email = await Email.bulkCreate(emails);


        let delete_phone_old = await Phone.destroy({ where: { property_id: property_id } });
        let phones = getPhoneSetPropertyId(req.body.Phones, property_id);
        let result_phone = await Phone.bulkCreate(phones);

        let delete_image_old = await Image.destroy({ where: { property_id: property_id } });
        let images = getImageSetPropertyId(req.body.Images, property_id);
        let result_image = await Image.bulkCreate(images);

        //tag, category, type
        let delete_tag_old = await PropertyTag.destroy({ where: { property_id: property_id } });
        let tags = getPropertyTag(req.body.tags, property_id);
        let result_tag = await PropertyTag.bulkCreate(tags);

        let delete_category_old = await PropertyCategory.destroy({ where: { property_id: property_id } });
        let categorys = getPropertyCategory(req.body.categorys, property_id);
        let result_category = await PropertyCategory.bulkCreate(categorys);

        let delete_type_old = await PropertyType.destroy({ where: { property_id: property_id } });
        let types = getPropertyType(req.body.types, property_id);
        let result_type = await PropertyType.bulkCreate(types);


        responseData(res, MessageHelper.getMessage(req.query.lang || 'vi', "update_property_success"));
    } catch (error) {
        if (error.constructor.name === 'ConnectionRefusedError') {
            Handler.cannotConnectDatabase(req, res);
        } else if (error.constructor.name === 'ValidationError' ||
            error.constructor.name === 'UniqueConstraintError') {
            Handler.validateError(req, res, error);
        } else if (error.constructor.name == 'ErrorModel') {
            Handler.handlingErrorModel(res, error);
        } else {
            handlingCannotUpdateProperty(req, res);
        }
    }

}
async function destroy(req, res) {
    try {
        let verify = await VerifyUtils.verifyProtectRequest(req);
        let property_id = req.query.id;
        deleteProperty(property_id);

        responseData(res, MessageHelper.getMessage(req.query.lang || 'vi', "delete_property_success"));
    } catch (error) {
        if (error.constructor.name === 'ConnectionRefusedError') {
            Handler.cannotConnectDatabase(req, res);
        } else if (error.constructor.name === 'ValidationError' ||
            error.constructor.name === 'UniqueConstraintError') {
            Handler.validateError(req, res, error);
        } else if (error.constructor.name == 'ErrorModel') {
            Handler.handlingErrorModel(res, error);
        } else {
            handlingCannotDestroyProperty(req, res);
        }
    }
}
async function deleteProperty(property_id){
    let data = await Property.destroy({ where: { id: property_id } });
    //relationship
    let result_feature = await Feature.destroy({ where: { property_id: property_id } });
    let result_email = await Email.destroy({ where: { property_id: property_id } });
    let result_phone = await Phone.destroy({ where: { property_id: property_id } });
    let result_image = await Image.destroy({ where: { property_id: property_id } });
    let result_property_tag = await PropertyTag.destroy({ where: { property_id: property_id } });
    let result_property_type = await PropertyType.destroy({ where: { property_id: property_id } });
    let result_property_category = await PropertyCategory.destroy({ where: { property_id: property_id } });
     //favorite, history,comment
}
function getModels(){
    let result=[
        {
            model: Feature,
            attributes: ['id', 'name']
        },
        {
            model: Tag,
            as: 'tags',
            attributes: {
                exclude: ['PropertyTag']
            },
            through: { attributes: [] }
        },
        {
            model: Category,
            as: 'categorys',
            attributes: {
                exclude: ['PropertyCategory']
            },
            through: { attributes: [] }
        },
        {
            model: Type,
            as: 'types',
            attributes: {
                exclude: ['PropertyType']
            },
            through: { attributes: [] }
        },
        {
            model: Email,
            attributes: ['id', 'name', 'email']
        },
        {
            model: Phone,
            attributes: ['id', 'name', 'phone_number']
        },
        {
            model: Image,
            attributes: ['id', 'url']
        }
    ];
    return result;
}
function getPropertyType(property_types, property_id) {
    let result = [];
    property_types.forEach(function (item) {
        result.push({
            property_id: property_id,
            type_id: item.id
        });
    });
    return result;
}
function getPropertyCategory(property_categorys, property_id) {
    let result = [];
    property_categorys.forEach(function (item) {
        result.push({
            property_id: property_id,
            category_id: item.id
        });
    });
    return result;
}
function getPropertyTag(property_tags, property_id) {
    let result = [];
    property_tags.forEach(function (item) {
        result.push({
            property_id: property_id,
            tag_id: item.id
        });
    });
    return result;
}
function getImageSetPropertyId(images, property_id) {
    let result = [];
    images.forEach(function (item) {
        result.push({
            url: item.url,
            property_id: property_id
        });
    });
    return result;
}
function getPhoneSetPropertyId(phones, property_id) {
    let result = [];
    phones.forEach(function (item) {
        result.push({
            name: item.name,
            phone_number: item.phone_number,
            property_id: property_id
        });
    });
    return result;
}
function getEmailSetPropertyId(emails, property_id) {
    let result = [];
    emails.forEach(function (item) {
        result.push({
            name: item.name,
            email: item.email,
            property_id: property_id
        });
    });
    return result;
}
function getFeatureSetPropertyId(feature, property_id) {
    let result = [];
    feature.forEach(function (item) {
        result.push({
            name: item.name,
            property_id: property_id
        });
    });
    return result;
}
function responseData(res, data) {
    res.status(200).json(new ResponseModel({
        code: 200,
        status_text: 'OK',
        success: true,
        data: data,
        errors: null
    }));
}
function handlingCanotGetAllProperty(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_get_property')]
    }));
}
function handlingCannotCreateProperty(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_create_property')]
    }));
}
function handlingCannotUpdateProperty(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_update_property')]
    }));
}
function handlingCannotDestroyProperty(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_destroy_property')]
    }))
}
function handlingCanotGetPropertyByUser(req, res) {
    res.status(503).json(new ResponseModel({
        code: 503,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'can_not_get_property_by_user')]
    }))
}
function errorVerifyApiKey(req, res) {
    res.status(505).json(new ResponseModel({
        code: 505,
        status_text: 'SERVICE UNAVAILABLE',
        success: false,
        data: null,
        errors: [getMessage(req, 'invalid_api_key')]
    }));
}
function getMessage(req, errorText) {
    return MessageHelper.getMessage(req.query.lang || 'vi', errorText);
}