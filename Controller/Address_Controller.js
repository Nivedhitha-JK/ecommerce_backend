import { addressModel } from "../Model/Address_schema.js";

export const addAddress = async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const { street, area, city, state, postalCode, country, isDefault } =
        req.body;

      if (isDefault) {
        await addressModel.updateMany({ userId: req.user._id }, { isDefault: false });
      }

      const newAddress = new addressModel({
        userId: req.user._id,
        street,
        area,
        city,
        state,
        postalCode,
        country,
        isDefault,
      });

      await newAddress.save();
      return res.status(201).json({
        success: true,
        message: "Address added successfully",
        address: newAddress,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can add addresses",
    });
  }
};

export const updateAddress = async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const { addressId, address } = req.body;

      const existingAddress = await addressModel.findOne({
        _id: addressId,
        userId: req.user._id,
      });

      if (existingAddress) {
        existingAddress.street = address.street || existingAddress.street;
        existingAddress.area = address.area || existingAddress.area;
        existingAddress.city = address.city || existingAddress.city;
        existingAddress.state = address.state || existingAddress.state;
        existingAddress.postalCode = address.postalCode || existingAddress.postalCode;
        existingAddress.country = address.country || existingAddress.country;
        existingAddress.isDefault = address.isDefault !== undefined ? address.isDefault : existingAddress.isDefault;

        if (address.isDefault) {
          await addressModel.updateMany({ userId: req.user._id }, { isDefault: false });
          existingAddress.isDefault = true;
        }

        await existingAddress.save();
        return res.status(200).json({
          success: true,
          message: "Address updated successfully",
          address: existingAddress,
        });
      } else {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can update their addresses",
    });
  }
};

export const deleteAddress = async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const { addressId } = req.body;

      const result = await addressModel.deleteOne({
        _id: addressId,
        userId: req.user._id,
      });

      if (result.deletedCount > 0) {
        return res.status(200).json({ success: true, message: "Address deleted successfully" });
      } else {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can delete their addresses",
    });
  }
};