import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Package, Plus, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { ItemCard } from "../../components/features/marketplace";
import {
  clearError,
  createItem,
  getAllItems,
  updateItem,
} from "../../slices/buyandsellSlice";
import {
  Button,
  Chip,
  EmptyState,
  Eyebrow,
  IconButton,
  Input,
  Modal,
  PageShell,
  SectionHeader,
  Select,
  SkeletonCard,
  Textarea,
} from "../../components/ui";

const categories = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Accessories",
  "Cycle",
  "Books",
  "Sports",
  "Other",
];

const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

const emptyItem = {
  item_name: "",
  price: "",
  category: "",
  description: "",
  item_condition: "",
  owner_contact: "",
  image: null,
};

const Marketplace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, loading, error } = useSelector((state) => state.buyAndSell);

  const [isFormOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [listingItem, setListingItem] = useState(emptyItem);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/marketplace" } });
      return;
    }
    dispatch(getAllItems());
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setListingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images need to be under 5MB.");
      return;
    }
    setListingItem((prev) => ({ ...prev, image: file }));
  };

  const openCreate = () => {
    setIsEditMode(false);
    setEditItemId(null);
    setListingItem(emptyItem);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormOpen(true);
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setListingItem({
      item_name: item.item_name,
      price: item.price,
      category: item.category,
      description: item.description,
      item_condition: item.item_condition,
      owner_contact: item.owner_contact,
      image: null,
      image_url: item.image_url,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setIsEditMode(false);
    setEditItemId(null);
    setListingItem(emptyItem);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedDescription = listingItem.description?.replace(
        /SELECT|INSERT|UPDATE|DELETE.*FROM/gi,
        "[removed]"
      );

      // FormData is assembled from the keys of listingItem, so every `name`
      // attribute in the form below must keep matching one of them.
      const formData = new FormData();
      Object.keys(listingItem).forEach((key) => {
        if (key === "image_url") return;
        if (key === "image" && listingItem[key] === null && isEditMode) return;
        if (key === "description") {
          formData.append(key, sanitizedDescription || "");
        } else {
          formData.append(key, listingItem[key]);
        }
      });

      if (isEditMode && editItemId) {
        await dispatch(updateItem({ id: editItemId, formData })).unwrap();
        toast.success("Listing updated.");
      } else {
        await dispatch(createItem(formData)).unwrap();
        toast.success("Listed. It is live now.");
      }
      closeForm();
    } catch (err) {
      toast.error(
        err?.message ||
          (isEditMode ? "Could not update that." : "Could not list that.")
      );
    }
  };

  const visibleItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch =
        !term ||
        item.item_name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);
      const matchesCategory = !category || item.category === category;
      const matchesPrice =
        (!priceRange.min || item.price >= Number(priceRange.min)) &&
        (!priceRange.max || item.price <= Number(priceRange.max));
      return matchesSearch && matchesCategory && matchesPrice;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "priceLowToHigh":
        return sorted.sort((a, b) => a.price - b.price);
      case "priceHighToLow":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [items, searchTerm, category, priceRange, sortBy]);

  const initialLoading = loading && !items.length;
  const hasFilters = Boolean(
    searchTerm || category || priceRange.min || priceRange.max
  );

  const clearAll = () => {
    setSearchTerm("");
    setCategory("");
    setPriceRange({ min: "", max: "" });
  };

  return (
    <PageShell width="wide">
      <SectionHeader
        eyebrow="CampusBazaar"
        tone="bazaar"
        rule
        title="Marketplace"
        description="Buy and sell inside campus, with people you can actually find."
        size="h2"
        action={
          <Button leadingIcon={Plus} onClick={openCreate}>
            Sell something
          </Button>
        }
      />

      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="search"
            placeholder="Search listings"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leadingIcon={Search}
            wrapperClassName="flex-1"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sm:w-52"
            aria-label="Sort order"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priceLowToHigh">Price: low to high</option>
            <option value="priceHighToLow">Price: high to low</option>
          </Select>
          <Button
            variant="outline"
            leadingIcon={SlidersHorizontal}
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
          >
            Price
          </Button>
        </div>

        {/* The price range was dead state with no control attached to it. */}
        {showFilters && (
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-end">
            <Input
              label="Min price"
              inputMode="numeric"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              placeholder="0"
              wrapperClassName="flex-1"
            />
            <Input
              label="Max price"
              inputMode="numeric"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              placeholder="Any"
              wrapperClassName="flex-1"
            />
            <Button
              variant="ghost"
              onClick={() => setPriceRange({ min: "", max: "" })}
            >
              Reset
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => setCategory("")}>
            All
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Listings</Eyebrow>
          <span className="numeric text-micro text-ink-4">
            {visibleItems.length}
            {hasFilters && items.length ? ` of ${items.length}` : ""}
          </span>
        </div>

        {initialLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <ItemCard key={item.id} item={item} onEdit={handleEditItem} />
            ))}
          </div>
        ) : hasFilters ? (
          <div className="mt-6">
            <EmptyState
              icon={SearchX}
              title="Nothing matches those filters"
              description="Try a broader category or a wider price range."
              action={
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Package}
              title="Nothing listed yet"
              description="Be the first. Textbooks and cycles move fastest at the start of a semester."
              action={
                <Button size="sm" onClick={openCreate}>
                  Sell something
                </Button>
              }
            />
          </div>
        )}
      </section>

      <Modal
        open={isFormOpen}
        onClose={closeForm}
        size="xl"
        title={isEditMode ? "Edit listing" : "Sell something"}
        description={
          isEditMode
            ? "Update the details on this listing."
            : "Add a photo and a real price — both roughly double the response rate."
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              {isEditMode ? "Save changes" : "Publish listing"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            name="item_name"
            label="What are you selling"
            required
            value={listingItem.item_name}
            onChange={handleInputChange}
            placeholder="e.g. Hero Sprint cycle"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              name="price"
              label="Price"
              required
              inputMode="numeric"
              value={listingItem.price}
              onChange={handleInputChange}
              placeholder="In rupees"
            />
            <Select
              name="category"
              label="Category"
              required
              value={listingItem.category}
              onChange={handleInputChange}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              name="item_condition"
              label="Condition"
              required
              value={listingItem.item_condition}
              onChange={handleInputChange}
            >
              <option value="">Select a condition</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </Select>
            <Input
              name="owner_contact"
              label="Contact number"
              required
              inputMode="numeric"
              value={listingItem.owner_contact}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
            />
          </div>

          <Textarea
            name="description"
            label="Description"
            rows={3}
            value={listingItem.description}
            onChange={handleInputChange}
            placeholder="Age, any damage, why you are selling, whether the price is negotiable."
          />

          <div className="flex flex-col gap-2">
            <span className="text-meta font-medium text-ink-2">Photo</span>

            {listingItem.image ? (
              <div className="flex items-center gap-2 text-meta text-ink-2">
                <span className="truncate">{listingItem.image.name}</span>
                <IconButton
                  icon={X}
                  label="Remove photo"
                  size="sm"
                  onClick={() => {
                    setListingItem((prev) => ({ ...prev, image: null }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
              </div>
            ) : listingItem.image_url ? (
              <img
                src={listingItem.image_url}
                alt="Current"
                className="h-36 w-fit rounded-card border border-line object-cover"
              />
            ) : null}

            <input
              ref={fileInputRef}
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full cursor-pointer text-meta text-ink-3 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-line-2 file:bg-surface-2 file:px-4 file:py-1.5 file:text-meta file:font-medium file:text-ink hover:file:bg-surface-3"
            />
            <p className="text-micro text-ink-4">
              Up to 5MB.{" "}
              {isEditMode && "Leave this empty to keep the current photo."}
            </p>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default Marketplace;
