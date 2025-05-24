import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";
import Filter from "./categoryFilterModel";

class FilterOption extends Model {
  public id!: number;
  public filterId!: number;
  public option!: string;
}

FilterOption.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Filter,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    option: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "filter_options",
    modelName: "FilterOption",
    indexes: [{ fields: ["filterId"] }],
    timestamps: true,
  }
);

export default FilterOption;
