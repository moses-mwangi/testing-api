"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
const sequelize_1 = require("sequelize");
const categoryModel_1 = __importDefault(require("../models/category/categoryModel"));
const subcategoryModel_1 = __importDefault(require("../models/category/subcategoryModel"));
const categoryFilterModel_1 = __importDefault(require("../models/category/categoryFilterModel"));
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const filterOption_1 = __importDefault(require("../models/category/filterOption"));
exports.categoryController = {
    createCategory: (0, catchSync_1.default)(async (req, res) => {
        const categoryData = req.body;
        if (!categoryData.name || !categoryData.slug) {
            throw new Error("Name and slug are required for a category.");
        }
        if (categoryData.subcategories) {
            categoryData.subcategories.forEach((subData) => {
                if (!subData.name || !subData.slug) {
                    throw new Error("Name and slug are required for a subcategory.");
                }
            });
        }
        const category = await pg_database_1.default.transaction(async (t) => {
            const newCategory = await categoryModel_1.default.create({
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                icon: categoryData.icon,
                banner: categoryData.banner,
                color: categoryData.color,
                itemCount: categoryData.itemCount,
                featured: categoryData.featured,
                trending: categoryData.trending,
            }, { transaction: t });
            if (categoryData.subcategories?.length) {
                await Promise.all(categoryData.subcategories.map(async (subData) => {
                    try {
                        const subcategory = await subcategoryModel_1.default.create({
                            name: subData.name,
                            slug: subData.slug,
                            description: subData.description,
                            itemCount: subData.itemCount,
                            categoryId: Number(newCategory.id),
                        }, { transaction: t });
                        if (subData.filters?.length) {
                            await Promise.all(subData.filters.map(async (filter) => {
                                console.log("Creating filter with data:", {
                                    name: subcategory.name,
                                    categoryId: subcategory.categoryId,
                                    subcategoryId: subcategory.id,
                                });
                                if (subcategory.categoryId === null ||
                                    subcategory.id === null) {
                                    res.json({ msg: "NO IDS " });
                                }
                                const newFilter = await categoryFilterModel_1.default.create({
                                    name: filter.name,
                                    subcategoryId: Number(subcategory.id),
                                    categoryId: Number(subcategory.categoryId),
                                }, { transaction: t });
                                // Create filter options
                                if (filter.options?.length) {
                                    await Promise.all(filter.options.map((option) => filterOption_1.default.create({
                                        option: option,
                                        filterId: newFilter.id,
                                    }, { transaction: t })));
                                }
                            }));
                        }
                    }
                    catch (err) {
                        console.error("Error creating subcategory:", err);
                        throw err;
                    }
                }));
            }
            // Create category filters if provided
            if (categoryData.filters?.length) {
                await Promise.all(categoryData.filters.map(async (filter) => {
                    const newFilter = await categoryFilterModel_1.default.create({
                        name: filter.name,
                        categoryId: newCategory.id,
                    }, { transaction: t });
                    // Create filter options
                    if (filter.options?.length) {
                        await Promise.all(filter.options.map((option) => filterOption_1.default.create({
                            option: option,
                            filterId: newFilter.id,
                        }, { transaction: t })));
                    }
                }));
            }
            return newCategory;
        });
        // Fetch the complete category with all associations
        const categoryWithAssociations = await categoryModel_1.default.findByPk(category.id, {
            include: [
                {
                    model: subcategoryModel_1.default,
                    as: "subcategories",
                    include: [
                        {
                            model: categoryFilterModel_1.default,
                            as: "filters",
                            include: [{ model: filterOption_1.default, as: "options" }],
                        },
                    ],
                },
                {
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    include: [{ model: filterOption_1.default, as: "options" }],
                },
            ],
        });
        res.status(201).json({
            status: "success",
            data: {
                category: categoryWithAssociations,
            },
        });
    }),
    getAllCategories: (0, catchSync_1.default)(async (req, res) => {
        const limit = 6;
        const categoryOffset = 0;
        const categories = await categoryModel_1.default.findAll({
            attributes: [
                "id",
                "name",
                "status",
                "slug",
                "itemCount",
                "banner",
                "icon",
                "description",
                "trending",
                "featured",
            ],
            // limit: limit,
            // offset: categoryOffset, // Pagination for categories
            include: [
                {
                    model: subcategoryModel_1.default,
                    as: "subcategories",
                    attributes: ["id", "name", "slug", "itemCount", "description"],
                    // limit: 3, // Limit subcategories
                    // offset: 0, // First round, start from 0
                    include: [
                        {
                            model: categoryFilterModel_1.default,
                            as: "filters",
                            attributes: ["id", "name"],
                            // limit: 2, // Limit filters per subcategory
                            // offset: 0,
                            include: [
                                {
                                    model: filterOption_1.default,
                                    as: "options",
                                    attributes: ["id", "option"],
                                    // limit: 3,
                                    // offset: 0,
                                },
                            ],
                        },
                    ],
                },
                {
                    where: { subcategoryId: null },
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    attributes: ["id", "name"],
                    // limit: 2, // Limit filters per category
                    // offset: 0,
                    include: [
                        {
                            model: filterOption_1.default,
                            as: "options",
                            attributes: ["id", "option"],
                            // limit: 3, // Limit filter options
                            // offset: 0,
                        },
                    ],
                },
            ],
        });
        res.status(200).json({
            status: "success",
            results: categories.length,
            data: {
                categories,
            },
        });
    }),
    getCategory: (0, catchSync_1.default)(async (req, res) => {
        const { identifier, id } = req.params;
        const category = await categoryModel_1.default.findOne({
            where: pg_database_1.default.or({ id: id }),
            attributes: [
                "id",
                "name",
                "status",
                "slug",
                "itemCount",
                "banner",
                "icon",
                "description",
            ],
            // limit: limit,
            // offset: categoryOffset, // Pagination for categories
            include: [
                {
                    model: subcategoryModel_1.default,
                    as: "subcategories",
                    attributes: ["id", "name", "slug", "itemCount", "description"],
                    // limit: 3, // Limit subcategories
                    // offset: 0, // First round, start from 0
                    include: [
                        {
                            model: categoryFilterModel_1.default,
                            as: "filters",
                            attributes: ["id", "name"],
                            // limit: 2, // Limit filters per subcategory
                            // offset: 0,
                            include: [
                                {
                                    model: filterOption_1.default,
                                    as: "options",
                                    attributes: ["id", "option"],
                                    // limit: 3,
                                    // offset: 0,
                                },
                            ],
                        },
                    ],
                },
                {
                    where: { subcategoryId: null },
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: filterOption_1.default,
                            as: "options",
                            attributes: ["id", "option"],
                        },
                    ],
                },
            ],
        });
        if (!category) {
            throw new AppError_1.default("Category not found", 404);
        }
        res.status(200).json({
            status: "success",
            data: {
                category,
            },
        });
    }),
    updateCategory: (0, catchSync_1.default)(async (req, res, next) => {
        const { id } = req.params;
        const updateDatas = { ...req.body };
        delete updateDatas.id;
        const category = await categoryModel_1.default.findByPk(id, {
            include: [
                {
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    where: { subcategoryId: null },
                    include: [{ model: filterOption_1.default, as: "options" }],
                },
            ],
        });
        if (!category) {
            return next(new AppError_1.default("Category not found", 404));
        }
        const updateData = {
            ...category.toJSON(),
            ...Object.fromEntries(Object.entries(updateDatas).filter(([_, value]) => value !== undefined)),
        };
        await pg_database_1.default.transaction(async (t) => {
            await category.update(updateData, { transaction: t });
            if (updateData.filters?.length) {
                const existingFilters = await categoryFilterModel_1.default.findAll({
                    where: { categoryId: id, subcategoryId: null },
                    transaction: t,
                });
                await Promise.all(existingFilters.map(async (filter) => {
                    await filterOption_1.default.destroy({
                        where: { filterId: filter.id },
                        transaction: t,
                    });
                    await filter.destroy({ transaction: t });
                }));
                await Promise.all(updateData.filters.map(async (filter) => {
                    const newFilter = await categoryFilterModel_1.default.create({
                        name: filter.name,
                        categoryId: id,
                    }, { transaction: t });
                    if (filter.options?.length) {
                        await Promise.all(filter.options.map((option) => filterOption_1.default.create({
                            option: option,
                            filterId: newFilter.id,
                        }, { transaction: t })));
                    }
                }));
            }
        });
        const updatedCategory = await categoryModel_1.default.findByPk(id, {
            include: [
                { model: subcategoryModel_1.default, as: "subcategories" },
                {
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    where: { subcategoryId: null },
                    include: [{ model: filterOption_1.default, as: "options" }],
                },
            ],
        });
        res.status(200).json({
            status: "success",
            data: {
                category: updatedCategory,
            },
        });
    }),
    deleteCategory: (0, catchSync_1.default)(async (req, res, next) => {
        const { id } = req.params;
        const transaction = await pg_database_1.default.transaction();
        try {
            const category = await categoryModel_1.default.findOne({
                where: { id },
                transaction,
            });
            if (!category) {
                await transaction.rollback();
                return next(new AppError_1.default("Category not found", 404));
            }
            const subcategories = await subcategoryModel_1.default.findAll({
                where: { categoryId: category.id },
                transaction,
            });
            const subcategoryIds = subcategories.map((sub) => sub.id);
            const filters = await categoryFilterModel_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { categoryId: category.id },
                        { subcategoryId: { [sequelize_1.Op.in]: subcategoryIds } },
                    ],
                },
                transaction,
            });
            const filterIds = filters.map((filter) => filter.id);
            await filterOption_1.default.destroy({
                where: { filterId: { [sequelize_1.Op.in]: filterIds } },
                transaction,
            });
            await categoryFilterModel_1.default.destroy({
                where: { id: { [sequelize_1.Op.in]: filterIds } },
                transaction,
            });
            await subcategoryModel_1.default.destroy({
                where: { id: { [sequelize_1.Op.in]: subcategoryIds } },
                transaction,
            });
            await categoryModel_1.default.destroy({
                where: { id },
                transaction,
            });
            await transaction.commit();
            res.status(204).json({
                status: "success",
                data: null,
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error("Error deleting category:", error.message);
            next(new AppError_1.default("Failed to delete category", 500));
        }
    }),
    // Add subcategory to category
    // addSubcategory: catchAsync(
    //   async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     const subcategoryData = req.body;
    //     const category = await Category.findByPk(id);
    //     if (!category) {
    //       throw new AppError("Category not found", 404);
    //     }
    //     const subcategory = await sequelize.transaction(
    //       async (t: Transaction) => {
    //         const newSubcategory = await Subcategory.create(
    //           {
    //             name: subcategoryData.name,
    //             slug: subcategoryData.slug,
    //             description: subcategoryData.description,
    //             itemCount: subcategoryData.itemCount,
    //             categoryId: Number(id),
    //           },
    //           { transaction: t }
    //         );
    //         if (subcategoryData.filters?.length) {
    //           await Promise.all(
    //             subcategoryData.filters.map(async (filter: any) => {
    //               if (
    //                 newSubcategory.categoryId === null ||
    //                 newSubcategory.id === null
    //               ) {
    //                 res.json({ msg: "NO IDS " });
    //               }
    //               const newFilter = await Filter.create(
    //                 {
    //                   name: filter.name,
    //                   subcategoryId: Number(newSubcategory.id),
    //                   categoryId: Number(id),
    //                 },
    //                 { transaction: t }
    //               );
    //               if (filter.options?.length) {
    //                 await Promise.all(
    //                   filter.options.map((option: string) =>
    //                     FilterOption.create(
    //                       {
    //                         option: option,
    //                         filterId: newFilter.id,
    //                       },
    //                       { transaction: t }
    //                     )
    //                   )
    //                 );
    //               }
    //             })
    //           );
    //         }
    //         return newSubcategory;
    //       }
    //     );
    //     // Fetch the subcategory with its filters
    //     const subcategoryWithFilters = await Subcategory.findByPk(
    //       subcategory.id,
    //       {
    //         include: [{ model: Filter, as: "filters" }],
    //       }
    //     );
    //     res.status(201).json({
    //       status: "success",
    //       data: {
    //         subcategory: subcategoryWithFilters,
    //       },
    //     });
    //   }
    // ),
    addSubcategory: (0, catchSync_1.default)(async (req, res, next) => {
        const { id } = req.params;
        const subcategoryData = req.body;
        const category = await categoryModel_1.default.findByPk(id);
        if (!category) {
            return next(new AppError_1.default("Category not found", 404));
        }
        const subcategory = await pg_database_1.default.transaction(async (t) => {
            const newSubcategory = await subcategoryModel_1.default.create({
                name: subcategoryData.name,
                slug: subcategoryData.slug,
                description: subcategoryData.description,
                itemCount: subcategoryData.itemCount,
                categoryId: Number(id),
            }, { transaction: t });
            if (subcategoryData.filters?.length) {
                await Promise.all(subcategoryData.filters.map(async (filter) => {
                    if (!newSubcategory.categoryId || !newSubcategory.id) {
                        throw new AppError_1.default("Subcategory or category ID missing", 400);
                    }
                    const newFilter = await categoryFilterModel_1.default.create({
                        name: filter.name,
                        subcategoryId: Number(newSubcategory.id),
                        categoryId: Number(id),
                    }, { transaction: t });
                    if (filter.options?.length) {
                        await Promise.all(filter.options.map((option) => filterOption_1.default.create({
                            option: option,
                            filterId: newFilter.id,
                        }, { transaction: t })));
                    }
                }));
            }
            return newSubcategory;
        });
        // Fetch the newly created subcategory with filters
        const subcategoryWithFilters = await subcategoryModel_1.default.findByPk(subcategory.id, {
            include: [{ model: categoryFilterModel_1.default, as: "filters" }],
        });
        if (!subcategoryWithFilters) {
            return next(new AppError_1.default("Subcategory could not be retrieved", 500));
        }
        res.status(201).json({
            status: "success",
            data: {
                subcategory: subcategoryWithFilters,
            },
        });
    }),
    getSubcategories: (0, catchSync_1.default)(async (req, res) => {
        const { id } = req.params;
        const subcategory = await subcategoryModel_1.default.findAll({
            where: { categoryId: id },
            include: [
                {
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    include: [{ model: filterOption_1.default, as: "options" }],
                },
            ],
        });
        res.status(201).json({ length: subcategory.length, subcategory });
    }),
    getSubcategory: (0, catchSync_1.default)(async (req, res) => {
        const { categoryId, subcategoryId } = req.params;
        const subcategory = await subcategoryModel_1.default.findOne({
            where: { categoryId: categoryId, id: subcategoryId },
            include: [
                {
                    attributes: ["id", "name", "categoryId", "subcategoryId"],
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    include: [
                        {
                            attributes: ["id", "filterId", "option"],
                            model: filterOption_1.default,
                            as: "options",
                        },
                    ],
                },
            ],
        });
        res.status(200).json({ subcategory });
    }),
    ////////////////// Update subcategory
    updateSubcategory: (0, catchSync_1.default)(async (req, res, next) => {
        const { categoryId, subcategoryId } = req.params;
        const updateDatas = { ...req.body };
        delete updateDatas.id;
        const subcategory = await subcategoryModel_1.default.findOne({
            where: { categoryId: categoryId, id: subcategoryId },
            include: [
                {
                    attributes: ["id", "name", "categoryId", "subcategoryId"],
                    model: categoryFilterModel_1.default,
                    as: "filters",
                    include: [
                        {
                            attributes: ["id", "filterId", "option"],
                            model: filterOption_1.default,
                            as: "options",
                        },
                    ],
                },
            ],
        });
        if (!subcategory) {
            return next(new AppError_1.default("Subcategory not found", 404));
        }
        // const updateData = {
        //   ...subcategory.toJSON(),
        //   ...Object.fromEntries(
        //     Object.entries(updateDatas).filter(
        //       ([_, value]) => value !== undefined
        //     )
        //   ),
        // };
        const updateData = {
            ...updateDatas,
        };
        await pg_database_1.default.transaction(async (t) => {
            await subcategory.update(updateData, { transaction: t });
            if (updateData.filters?.length) {
                const existingFilters = await categoryFilterModel_1.default.findAll({
                    where: { categoryId: categoryId, subcategoryId: subcategoryId },
                    transaction: t,
                });
                await Promise.all(existingFilters.map(async (filter) => {
                    await filterOption_1.default.destroy({
                        where: { filterId: filter.id },
                        transaction: t,
                    });
                    if (existingFilters.length > 0) {
                        await filter.destroy({ transaction: t });
                        await categoryFilterModel_1.default.destroy({
                            where: {
                                categoryId: categoryId,
                                subcategoryId: subcategoryId,
                            },
                            transaction: t,
                        });
                    }
                }));
                await Promise.all(updateData.filters.map(async (filter) => {
                    const newFilter = await categoryFilterModel_1.default.create({
                        name: filter.name,
                        categoryId: categoryId,
                        subcategoryId: subcategoryId,
                    }, { transaction: t });
                    if (filter.options?.length) {
                        await Promise.all(filter.options.map((option) => filterOption_1.default.create({
                            option: option,
                            filterId: newFilter.id,
                        }, { transaction: t })));
                    }
                }));
            }
        });
        // Fetch updated subcategory with filters
        const updatedSubcategory = await subcategoryModel_1.default.findByPk(subcategoryId, {
            include: [{ model: categoryFilterModel_1.default, as: "filters" }],
        });
        res.status(200).json({
            status: "success",
            data: {
                subcategory: updatedSubcategory,
            },
        });
    }),
    // Remove subcategory
    removeSubcategory: (0, catchSync_1.default)(async (req, res, next) => {
        const { categoryId, subcategoryId } = req.params;
        const transaction = await pg_database_1.default.transaction();
        try {
            const subcategory = await subcategoryModel_1.default.findOne({
                where: {
                    id: subcategoryId,
                    categoryId,
                },
                transaction,
            });
            if (!subcategory) {
                await transaction.rollback();
                return next(new AppError_1.default("SubCategory not found", 404));
            }
            const filters = await categoryFilterModel_1.default.findAll({
                where: {
                    categoryId: categoryId,
                    subcategoryId: subcategoryId,
                },
                transaction,
            });
            const filterIds = filters.map((filter) => filter.id);
            await filterOption_1.default.destroy({
                where: { filterId: { [sequelize_1.Op.in]: filterIds } },
                transaction,
            });
            await categoryFilterModel_1.default.destroy({
                where: { id: { [sequelize_1.Op.in]: filterIds } },
                transaction,
            });
            await subcategoryModel_1.default.destroy({
                where: { id: subcategoryId, categoryId: categoryId },
                transaction,
            });
            await transaction.commit();
            res.status(204).json({
                status: "success",
                data: null,
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error("Error deleting category:", error.message);
            next(new AppError_1.default("Failed to delete category", 500));
        }
    }),
    // NOT USED Update category filters
    updateFilters: (0, catchSync_1.default)(async (req, res) => {
        const { id } = req.params;
        const { filters } = req.body;
        const category = await categoryModel_1.default.findByPk(id);
        if (!category) {
            throw new AppError_1.default("Category not found", 404);
        }
        await pg_database_1.default.transaction(async (t) => {
            // Remove existing filters
            await categoryFilterModel_1.default.destroy({
                where: { categoryId: id },
                transaction: t,
            });
            // Create new filters
            await Promise.all(filters.map((filter) => categoryFilterModel_1.default.create({ ...filter, categoryId: id }, { transaction: t })));
        });
        // Fetch updated category with filters
        const updatedCategory = await categoryModel_1.default.findByPk(id, {
            include: [{ model: categoryFilterModel_1.default, as: "filters" }],
        });
        res.status(200).json({
            status: "success",
            data: {
                category: updatedCategory,
            },
        });
    }),
};
