import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/utils/catchSync";
import sequelize from "../../../shared/config/pg_database";
import { Op, Transaction } from "sequelize";
import Category from "../models/category/categoryModel";
import Subcategory from "../models/category/subcategoryModel";
import Filter from "../models/category/categoryFilterModel";
import AppError from "../../../shared/utils/AppError";
import FilterOption from "../models/category/filterOption";

export const categoryController = {
  createCategory: catchAsync(async (req: Request, res: Response) => {
    const categoryData = req.body;

    if (!categoryData.name || !categoryData.slug) {
      throw new Error("Name and slug are required for a category.");
    }

    if (categoryData.subcategories) {
      categoryData.subcategories.forEach((subData: any) => {
        if (!subData.name || !subData.slug) {
          throw new Error("Name and slug are required for a subcategory.");
        }
      });
    }

    const category = await sequelize.transaction(async (t: Transaction) => {
      const newCategory = await Category.create(
        {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          banner: categoryData.banner,
          color: categoryData.color,
          itemCount: categoryData.itemCount,
          featured: categoryData.featured,
          trending: categoryData.trending,
        },
        { transaction: t }
      );

      if (categoryData.subcategories?.length) {
        await Promise.all(
          categoryData.subcategories.map(async (subData: any) => {
            try {
              const subcategory = await Subcategory.create(
                {
                  name: subData.name,
                  slug: subData.slug,
                  description: subData.description,
                  itemCount: subData.itemCount,
                  categoryId: Number(newCategory.id),
                },
                { transaction: t }
              );

              if (subData.filters?.length) {
                await Promise.all(
                  subData.filters.map(async (filter: any) => {
                    console.log("Creating filter with data:", {
                      name: subcategory.name,
                      categoryId: subcategory.categoryId,
                      subcategoryId: subcategory.id,
                    });

                    if (
                      subcategory.categoryId === null ||
                      subcategory.id === null
                    ) {
                      res.json({ msg: "NO IDS " });
                    }
                    const newFilter = await Filter.create(
                      {
                        name: filter.name,
                        subcategoryId: Number(subcategory.id),
                        categoryId: Number(subcategory.categoryId),
                      },
                      { transaction: t }
                    );

                    // Create filter options
                    if (filter.options?.length) {
                      await Promise.all(
                        filter.options.map((option: string) =>
                          FilterOption.create(
                            {
                              option: option,
                              filterId: newFilter.id,
                            },
                            { transaction: t }
                          )
                        )
                      );
                    }
                  })
                );
              }
            } catch (err) {
              console.error("Error creating subcategory:", err);
              throw err;
            }
          })
        );
      }

      // Create category filters if provided
      if (categoryData.filters?.length) {
        await Promise.all(
          categoryData.filters.map(async (filter: any) => {
            const newFilter = await Filter.create(
              {
                name: filter.name,
                categoryId: newCategory.id,
              },
              { transaction: t }
            );

            // Create filter options
            if (filter.options?.length) {
              await Promise.all(
                filter.options.map((option: string) =>
                  FilterOption.create(
                    {
                      option: option,
                      filterId: newFilter.id,
                    },
                    { transaction: t }
                  )
                )
              );
            }
          })
        );
      }

      return newCategory;
    });

    // Fetch the complete category with all associations
    const categoryWithAssociations = await Category.findByPk(category.id, {
      include: [
        {
          model: Subcategory,
          as: "subcategories",
          include: [
            {
              model: Filter,
              as: "filters",
              include: [{ model: FilterOption, as: "options" }],
            },
          ],
        },
        {
          model: Filter,
          as: "filters",
          include: [{ model: FilterOption, as: "options" }],
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

  getAllCategories: catchAsync(async (req: Request, res: Response) => {
    const limit = 6;
    const categoryOffset = 0;

    const categories = await Category.findAll({
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
          model: Subcategory,
          as: "subcategories",
          attributes: ["id", "name", "slug", "itemCount", "description"],
          // limit: 3, // Limit subcategories
          // offset: 0, // First round, start from 0
          include: [
            {
              model: Filter,
              as: "filters",
              attributes: ["id", "name"],
              // limit: 2, // Limit filters per subcategory
              // offset: 0,
              include: [
                {
                  model: FilterOption,
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
          model: Filter,
          as: "filters",
          attributes: ["id", "name"],
          // limit: 2, // Limit filters per category
          // offset: 0,
          include: [
            {
              model: FilterOption,
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

  getCategory: catchAsync(async (req: Request, res: Response) => {
    const { identifier, id } = req.params;

    const category = await Category.findOne({
      where: sequelize.or({ id: id }),
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
          model: Subcategory,
          as: "subcategories",
          attributes: ["id", "name", "slug", "itemCount", "description"],
          // limit: 3, // Limit subcategories
          // offset: 0, // First round, start from 0
          include: [
            {
              model: Filter,
              as: "filters",
              attributes: ["id", "name"],
              // limit: 2, // Limit filters per subcategory
              // offset: 0,
              include: [
                {
                  model: FilterOption,
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
          model: Filter,
          as: "filters",
          attributes: ["id", "name"],

          include: [
            {
              model: FilterOption,
              as: "options",
              attributes: ["id", "option"],
            },
          ],
        },
      ],
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  }),

  updateCategory: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateDatas = { ...req.body };

      delete updateDatas.id;

      const category = await Category.findByPk(id, {
        include: [
          {
            model: Filter,
            as: "filters",
            where: { subcategoryId: null },
            include: [{ model: FilterOption, as: "options" }],
          },
        ],
      });

      if (!category) {
        return next(new AppError("Category not found", 404));
      }

      const updateData = {
        ...category.toJSON(),
        ...Object.fromEntries(
          Object.entries(updateDatas).filter(
            ([_, value]) => value !== undefined
          )
        ),
      };

      await sequelize.transaction(async (t: Transaction) => {
        await category.update(updateData, { transaction: t });

        if (updateData.filters?.length) {
          const existingFilters = await Filter.findAll({
            where: { categoryId: id, subcategoryId: null },
            transaction: t,
          });

          await Promise.all(
            existingFilters.map(async (filter) => {
              await FilterOption.destroy({
                where: { filterId: filter.id },
                transaction: t,
              });
              await filter.destroy({ transaction: t });
            })
          );

          await Promise.all(
            updateData.filters.map(async (filter: any) => {
              const newFilter = await Filter.create(
                {
                  name: filter.name,
                  categoryId: id,
                },
                { transaction: t }
              );

              if (filter.options?.length) {
                await Promise.all(
                  filter.options.map((option: string) =>
                    FilterOption.create(
                      {
                        option: option,
                        filterId: newFilter.id,
                      },
                      { transaction: t }
                    )
                  )
                );
              }
            })
          );
        }
      });

      const updatedCategory = await Category.findByPk(id, {
        include: [
          { model: Subcategory, as: "subcategories" },
          {
            model: Filter,
            as: "filters",
            where: { subcategoryId: null },
            include: [{ model: FilterOption, as: "options" }],
          },
        ],
      });

      res.status(200).json({
        status: "success",
        data: {
          category: updatedCategory,
        },
      });
    }
  ),

  deleteCategory: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const transaction = await sequelize.transaction();

      try {
        const category = await Category.findOne({
          where: { id },
          transaction,
        });

        if (!category) {
          await transaction.rollback();
          return next(new AppError("Category not found", 404));
        }

        const subcategories = await Subcategory.findAll({
          where: { categoryId: category.id },
          transaction,
        });

        const subcategoryIds = subcategories.map((sub) => sub.id);

        const filters = await Filter.findAll({
          where: {
            [Op.or]: [
              { categoryId: category.id },
              { subcategoryId: { [Op.in]: subcategoryIds } },
            ],
          },
          transaction,
        });

        const filterIds = filters.map((filter) => filter.id);

        await FilterOption.destroy({
          where: { filterId: { [Op.in]: filterIds } },
          transaction,
        });

        await Filter.destroy({
          where: { id: { [Op.in]: filterIds } },
          transaction,
        });

        await Subcategory.destroy({
          where: { id: { [Op.in]: subcategoryIds } },
          transaction,
        });

        await Category.destroy({
          where: { id },
          transaction,
        });

        await transaction.commit();

        res.status(204).json({
          status: "success",
          data: null,
        });
      } catch (error) {
        await transaction.rollback();
        console.error("Error deleting category:", (error as any).message);
        next(new AppError("Failed to delete category", 500));
      }
    }
  ),

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

  addSubcategory: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const subcategoryData = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return next(new AppError("Category not found", 404));
      }

      const subcategory = await sequelize.transaction(
        async (t: Transaction) => {
          const newSubcategory = await Subcategory.create(
            {
              name: subcategoryData.name,
              slug: subcategoryData.slug,
              description: subcategoryData.description,
              itemCount: subcategoryData.itemCount,
              categoryId: Number(id),
            },
            { transaction: t }
          );

          if (subcategoryData.filters?.length) {
            await Promise.all(
              subcategoryData.filters.map(async (filter: any) => {
                if (!newSubcategory.categoryId || !newSubcategory.id) {
                  throw new AppError("Subcategory or category ID missing", 400);
                }

                const newFilter = await Filter.create(
                  {
                    name: filter.name,
                    subcategoryId: Number(newSubcategory.id),
                    categoryId: Number(id),
                  },
                  { transaction: t }
                );

                if (filter.options?.length) {
                  await Promise.all(
                    filter.options.map((option: string) =>
                      FilterOption.create(
                        {
                          option: option,
                          filterId: newFilter.id,
                        },
                        { transaction: t }
                      )
                    )
                  );
                }
              })
            );
          }

          return newSubcategory;
        }
      );

      // Fetch the newly created subcategory with filters
      const subcategoryWithFilters = await Subcategory.findByPk(
        subcategory.id,
        {
          include: [{ model: Filter, as: "filters" }],
        }
      );

      if (!subcategoryWithFilters) {
        return next(new AppError("Subcategory could not be retrieved", 500));
      }

      res.status(201).json({
        status: "success",
        data: {
          subcategory: subcategoryWithFilters,
        },
      });
    }
  ),

  getSubcategories: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subcategory = await Subcategory.findAll({
      where: { categoryId: id },
      include: [
        {
          model: Filter,
          as: "filters",
          include: [{ model: FilterOption, as: "options" }],
        },
      ],
    });

    res.status(201).json({ length: subcategory.length, subcategory });
  }),

  getSubcategory: catchAsync(async (req: Request, res: Response) => {
    const { categoryId, subcategoryId } = req.params;
    const subcategory = await Subcategory.findOne({
      where: { categoryId: categoryId, id: subcategoryId },
      include: [
        {
          attributes: ["id", "name", "categoryId", "subcategoryId"],
          model: Filter,
          as: "filters",
          include: [
            {
              attributes: ["id", "filterId", "option"],
              model: FilterOption,
              as: "options",
            },
          ],
        },
      ],
    });

    res.status(200).json({ subcategory });
  }),

  ////////////////// Update subcategory
  updateSubcategory: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { categoryId, subcategoryId } = req.params;
      const updateDatas = { ...req.body };

      delete updateDatas.id;

      const subcategory = await Subcategory.findOne({
        where: { categoryId: categoryId, id: subcategoryId },
        include: [
          {
            attributes: ["id", "name", "categoryId", "subcategoryId"],
            model: Filter,
            as: "filters",
            include: [
              {
                attributes: ["id", "filterId", "option"],
                model: FilterOption,
                as: "options",
              },
            ],
          },
        ],
      });

      if (!subcategory) {
        return next(new AppError("Subcategory not found", 404));
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

      await sequelize.transaction(async (t: Transaction) => {
        await subcategory.update(updateData, { transaction: t });

        if (updateData.filters?.length) {
          const existingFilters = await Filter.findAll({
            where: { categoryId: categoryId, subcategoryId: subcategoryId },
            transaction: t,
          });

          await Promise.all(
            existingFilters.map(async (filter) => {
              await FilterOption.destroy({
                where: { filterId: filter.id },
                transaction: t,
              });

              if (existingFilters.length > 0) {
                await filter.destroy({ transaction: t });
                await Filter.destroy({
                  where: {
                    categoryId: categoryId,
                    subcategoryId: subcategoryId,
                  },
                  transaction: t,
                });
              }
            })
          );

          await Promise.all(
            updateData.filters.map(async (filter: any) => {
              const newFilter = await Filter.create(
                {
                  name: filter.name,
                  categoryId: categoryId,
                  subcategoryId: subcategoryId,
                },
                { transaction: t }
              );

              if (filter.options?.length) {
                await Promise.all(
                  filter.options.map((option: string) =>
                    FilterOption.create(
                      {
                        option: option,
                        filterId: newFilter.id,
                      },
                      { transaction: t }
                    )
                  )
                );
              }
            })
          );
        }
      });

      // Fetch updated subcategory with filters
      const updatedSubcategory = await Subcategory.findByPk(subcategoryId, {
        include: [{ model: Filter, as: "filters" }],
      });

      res.status(200).json({
        status: "success",
        data: {
          subcategory: updatedSubcategory,
        },
      });
    }
  ),

  // Remove subcategory
  removeSubcategory: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { categoryId, subcategoryId } = req.params;

      const transaction = await sequelize.transaction();

      try {
        const subcategory = await Subcategory.findOne({
          where: {
            id: subcategoryId,
            categoryId,
          },
          transaction,
        });

        if (!subcategory) {
          await transaction.rollback();
          return next(new AppError("SubCategory not found", 404));
        }

        const filters = await Filter.findAll({
          where: {
            categoryId: categoryId,
            subcategoryId: subcategoryId,
          },
          transaction,
        });

        const filterIds = filters.map((filter) => filter.id);

        await FilterOption.destroy({
          where: { filterId: { [Op.in]: filterIds } },
          transaction,
        });

        await Filter.destroy({
          where: { id: { [Op.in]: filterIds } },
          transaction,
        });

        await Subcategory.destroy({
          where: { id: subcategoryId, categoryId: categoryId },
          transaction,
        });

        await transaction.commit();

        res.status(204).json({
          status: "success",
          data: null,
        });
      } catch (error) {
        await transaction.rollback();
        console.error("Error deleting category:", (error as any).message);
        next(new AppError("Failed to delete category", 500));
      }
    }
  ),

  // NOT USED Update category filters
  updateFilters: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { filters } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    await sequelize.transaction(async (t: Transaction) => {
      // Remove existing filters
      await Filter.destroy({
        where: { categoryId: id },
        transaction: t,
      });

      // Create new filters
      await Promise.all(
        filters.map((filter: any) =>
          Filter.create({ ...filter, categoryId: id }, { transaction: t })
        )
      );
    });

    // Fetch updated category with filters
    const updatedCategory = await Category.findByPk(id, {
      include: [{ model: Filter, as: "filters" }],
    });

    res.status(200).json({
      status: "success",
      data: {
        category: updatedCategory,
      },
    });
  }),
};
