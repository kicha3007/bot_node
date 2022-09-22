export enum ENV_NAMES {
	TOKEN = 'TOKEN',
}

export enum SCENES_NAMES {
	START = 'START',
	CATALOG = 'CATALOG',
	DETAIL = 'DETAIL',
	CART = 'CART',
}

export enum STEPS_NAMES {
	BASE_STEP = 'BASE_STEP',
	SET_CITY = 'SET_CITY',
	SET_ADDRESS = 'SET_ADDRESS',
	SET_BUTTONS = 'SET_BUTTONS',
	EMPTY_CART = 'EMPTY_CART',
	GO_TO_NEXT_SCENE = 'GO_TO_NEXT_SCENE',
}

export enum MESSAGES {
	SET_YOUR_CITY = 'Введите ваш город',
	SET_YOUR_ADDRESS = 'Введите адрес',
	MY_ORDERS = 'Корзина',
	PREV = '⏪ prev',
	NEXT = 'next ⏩',
	CATALOG = 'Каталог товаров',
	BACK_TO_CATALOG = 'Назад в каталог',
	DETAIL_DESCRIPTION = 'Детальное описание',
	ADD_TO_CART = 'Добавить в корзину',
	ADD_TO_CART_DONE = 'Товар добавлен в корзину',
	PRODUCT_SUM = 'Общая стоимость продукта',
	REMOVE_PRODUCT = '❌',
	INCREMENT_PRODUCT_COUNT = '+',
	DECREMENT_PRODUCT_COUNT = '−',
	CURRENT_PRODUCT_COUNT = 'Количество товара',
	TO_PAY = 'Оформить',
	AMOUNT_TITLES = 'Количество наименований',
	EMPTY_CART = 'Корзина пуста',
	NAVIGATION_TITLE = 'Навигация',
	COUNT_PRODUCT_IN_LIST = 'Позиция товара в списке',
}

export enum MARKUP_TYPES {
	TEXT = 'text',
	HTML = 'html',
}

export enum PROPERTY_STORAGE_NAMES {
	CURRENT_STEP_NAME = 'currentStepName',
	PRODUCT_MESSAGE_ID = 'productMessageId',
	PRODUCT_POSITION = 'productPosition',
	PRODUCT_ID = 'productId',
}

export const DEFAULT_CART_PRODUCT_POSITION = 1;
