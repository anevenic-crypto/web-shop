import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const category = pgTable("category", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const product = pgTable(
	"product",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		description: text("description"),
		brand: text("brand"),
		priceRsd: integer("price_rsd").notNull(),
		stock: integer("stock").default(0).notNull(),
		categoryId: text("category_id").references(() => category.id, {
			onDelete: "set null",
		}),
		isPublished: boolean("is_published").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("product_slug_idx").on(table.slug),
		index("product_categoryId_idx").on(table.categoryId),
	],
);

export const productImage = pgTable(
	"product_image",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		productId: text("product_id")
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),
		key: text("key").notNull(),
		url: text("url").notNull(),
		position: integer("position").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("productImage_productId_idx").on(table.productId)],
);

export const productVariant = pgTable(
	"product_variant",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		productId: text("product_id")
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		colorHex: text("color_hex"),
		stock: integer("stock").default(0).notNull(),
		position: integer("position").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("productVariant_productId_idx").on(table.productId)],
);

export const promo = pgTable("promo", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	body: text("body").notNull(),
	imageKey: text("image_key"),
	imageUrl: text("image_url"),
	position: integer("position").default(0).notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const order = pgTable("order", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	customerName: text("customer_name").notNull(),
	phone: text("phone").notNull(),
	address: text("address").notNull(),
	note: text("note"),
	totalRsd: integer("total_rsd").notNull(),
	status: text("status").default("novo").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItem = pgTable(
	"order_item",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		orderId: text("order_id")
			.notNull()
			.references(() => order.id, { onDelete: "cascade" }),
		productId: text("product_id").references(() => product.id, {
			onDelete: "set null",
		}),
		name: text("name").notNull(),
		variantName: text("variant_name"),
		priceRsd: integer("price_rsd").notNull(),
		quantity: integer("quantity").notNull(),
	},
	(table) => [index("orderItem_orderId_idx").on(table.orderId)],
);

export const contactMessage = pgTable("contact_message", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	email: text("email").notNull(),
	message: text("message").notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderRelations = relations(order, ({ many }) => ({
	items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id],
	}),
}));

export const categoryRelations = relations(category, ({ many }) => ({
	products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(category, {
		fields: [product.categoryId],
		references: [category.id],
	}),
	images: many(productImage),
	variants: many(productVariant),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
	product: one(product, {
		fields: [productImage.productId],
		references: [product.id],
	}),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
	product: one(product, {
		fields: [productVariant.productId],
		references: [product.id],
	}),
}));
