import Listing from "../models/Listing.js";

const listingPopulate = [
  {
    path: "farmerId",
    select: "name phone location",
  },
];

export const createListing = async (req, res) => {
  try {
    const { cropName, category, quantity, price, harvestDate, description, district, state } = req.body;

    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const listing = await Listing.create({
      farmerId: req.user._id,
      cropName,
      category,
      quantity: Number(quantity),
      price: Number(price),
      harvestDate,
      description,
      location: {
        district,
        state,
      },
      images,
      status: "active",
    });

    const populated = await Listing.findById(listing._id).populate(listingPopulate);
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create listing" });
  }
};

export const getMarketplaceListings = async (req, res) => {
  try {
    const { category, state, minPrice, maxPrice, sort = "newest", search } = req.query;
    const query = { status: "active" };

    if (category) {
      query.category = category;
    }

    if (state) {
      query["location.state"] = state;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (search) {
      query.$or = [
        { cropName: { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
        { "location.district": { $regex: search, $options: "i" } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      "price-low-high": { price: 1 },
      "price-high-low": { price: -1 },
    };

    const listings = await Listing.find(query).populate(listingPopulate).sort(sortMap[sort] || sortMap.newest);
    return res.json(listings);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch listings" });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(listingPopulate);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.json(listing);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch listing" });
  }
};

export const getFarmerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    return res.json(listings);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to fetch your listings" });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, farmerId: req.user._id });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const body = req.body;
    const incomingImages = (req.files || []).map((file) => `/uploads/${file.filename}`);

    listing.cropName = body.cropName ?? listing.cropName;
    listing.category = body.category ?? listing.category;
    listing.quantity = body.quantity ? Number(body.quantity) : listing.quantity;
    listing.price = body.price ? Number(body.price) : listing.price;
    listing.harvestDate = body.harvestDate ?? listing.harvestDate;
    listing.description = body.description ?? listing.description;
    listing.status = body.status ?? listing.status;
    listing.location = {
      district: body.district ?? listing.location.district,
      state: body.state ?? listing.location.state,
    };

    if (incomingImages.length > 0) {
      listing.images = incomingImages;
    }

    await listing.save();
    return res.json(listing);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to update listing" });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({ _id: req.params.id, farmerId: req.user._id });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.json({ message: "Listing deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to delete listing" });
  }
};
