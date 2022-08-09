"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var userInfo = {
    name: 'Иван',
    id: 1
};
var productsList = [
    {
        title: 'Шарик 1',
        price: 100,
        description: 'Описание шарика 1',
        image: 'https://megashar-nsk.ru/images/gelievye_shary/2021/gelievue-shary2021-2.jpg',
        size: 's'
    },
    {
        title: 'Шарик 2',
        price: 300,
        description: 'Описание шарика 2',
        image: 'https://84.img.avito.st/image/1/1.GTXVcba6tdzj2HfZ61VTayfSs9hhUr0eZNKx1GHatw.QCwhmlW15b3YaWgq-C09OvE-5VJHN7AKhQgEZhXP95U',
        size: 'm'
    },
    {
        title: 'Шарик 3',
        price: 400,
        description: 'Описание шарика 3',
        image: 'https://i.pinimg.com/originals/64/4f/55/644f551289e01fdf9e4a05172bf373b4.jpg',
        size: 's'
    },
    {
        title: 'Шарик 4',
        price: 400,
        description: 'Описание шарика 4',
        image: 'https://shop-cdn1.vigbo.tech/shops/46256//products/14365412/images/2-f45526fa9644dba03ab9d49703102a35.jpg?version=undefined',
        size: 's'
    },
    {
        title: 'Шарик 5',
        price: 400,
        description: 'Описание товара',
        image: 'https://st.shop-serpantin.ru/8/2503/238/tOod87GfeHY.jpg',
        size: 's'
    },
];
var createUser = function (_a) {
    var user = _a.user;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, prisma.userModel.create({ data: user })];
        });
    });
};
var createCart = function (_a) {
    var cart = _a.cart;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma.cartModel.create({ data: cart })];
                case 1: return [2 /*return*/, _b.sent()];
            }
        });
    });
};
var createProducts = function (_a) {
    var products = _a.products;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma.productModel.createMany({ data: products })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var getProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.productModel.findMany()];
    });
}); };
var fillCartProducts = function (_a) {
    var products = _a.products, cartId = _a.cartId;
    return __awaiter(void 0, void 0, void 0, function () {
        var cartProducts;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cartProducts = products.map(function (product) { return ({
                        productId: product.id,
                        cartId: cartId
                    }); });
                    return [4 /*yield*/, prisma.cartProductModel.createMany({ data: cartProducts })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var createContact = function (_a) {
    var contact = _a.contact;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma.contactModel.create({ data: contact })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$connect()];
            case 1:
                _a.sent();
                //TODO пока закомментировал добавление всех остальных данных в бд, кроме продуктов, в целях удобства разработки
                /*	const createdUser = await createUser({ user: userInfo });
            
                const cart = { userId: createdUser.id };
                const createdCart = await createCart({ cart });*/
                return [4 /*yield*/, createProducts({ products: productsList })];
            case 2:
                //TODO пока закомментировал добавление всех остальных данных в бд, кроме продуктов, в целях удобства разработки
                /*	const createdUser = await createUser({ user: userInfo });
            
                const cart = { userId: createdUser.id };
                const createdCart = await createCart({ cart });*/
                _a.sent();
                /*const createdProducts = await getProducts();
                await fillCartProducts({ products: createdProducts, cartId: createdCart.id });
            
                const contact = {
                    city: 'Краснояр',
                    address: 'Шикарная 10 стр 3',
                    userId: createdUser.id,
                };
                await createContact({ contact });*/
                return [4 /*yield*/, prisma.$disconnect()];
            case 3:
                /*const createdProducts = await getProducts();
                await fillCartProducts({ products: createdProducts, cartId: createdCart.id });
            
                const contact = {
                    city: 'Краснояр',
                    address: 'Шикарная 10 стр 3',
                    userId: createdUser.id,
                };
                await createContact({ contact });*/
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
main();
