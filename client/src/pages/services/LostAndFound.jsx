// LostAndFound.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ImageIcon, Plus, Search, SearchX, X } from "lucide-react";
import {
  addLostItem,
  clearLostAndFoundError,
  fetchLostItems,
  updateLostItem,
} from "../../slices/lostAndFoundSlice";
import LostItemCard from "../../components/features/marketplace/LostItemCard";
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
  "Documents",
  "Keys",
  "Wallets/Purses",
  "Clothing",
  "Accessories",
  "Books/Notes",
  "Cards",
  "Other",
];

const emptyItem = {
  item_name: "",
  description: "",
  location_found: "",
  owner_contact: "",
  category: "",
  image: null,
  image_url: null,
};

const LostAndFound = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.lostAndFound);
  const { user } = useSelector((state) => state.auth);

  const [isFormOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [listingItem, setListingItem] = useState(emptyItem);

  // Replaces document.getElementById("imageUpload").value = "" in two places.
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchLostItems());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearLostAndFoundError());
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
    const reader = new FileReader();
    reader.onloadend = () =>
      setListingItem((prev) => ({
        ...prev,
        image: file,
        image_url: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setListingItem((prev) => ({ ...prev, image: null, image_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetFormAndState = () => {
    setListingItem(emptyItem);
    setIsEditMode(false);
    setEditItemId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setListingItem({
      item_name: item.item_name || "",
      description: item.description || "",
      location_found: item.location_found || "",
      owner_contact: item.owner_contact || "",
      category: item.category || "",
      image: null,
      image_url: item.image_url || null,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetFormAndState();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !listingItem.item_name ||
      !listingItem.category ||
      !listingItem.location_found ||
      !listingItem.owner_contact
    ) {
      toast.error("Fill in the name, category, location and a contact number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(listingItem.owner_contact)) {
      toast.error("That does not look like a 10-digit Indian mobile number.");
      return;
    }

    // Keys come straight off listingItem, so the `name` attributes on the
    // inputs below must keep matching its shape.
    const formData = new FormData();
    Object.keys(listingItem).forEach((key) => {
      if (key === "image_url") return;
      if (key === "image") {
        if (listingItem.image) formData.append(key, listingItem.image);
      } else {
        formData.append(key, listingItem[key] || "");
      }
    });

    try {
      if (isEditMode && editItemId) {
        await dispatch(updateLostItem({ id: editItemId, formData })).unwrap();
        toast.success("Report updated.");
      } else {
        await dispatch(addLostItem(formData)).unwrap();
        toast.success("Reported. Thanks for posting it.");
      }
      closeForm();
    } catch (err) {
      toast.error(
        err?.payload ||
          err?.message ||
          (isEditMode ? "Could not update that." : "Could not post that.")
      );
    }
  };

  const visibleItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const result = items.filter((item) => {
      const matchesSearch =
        !term ||
        item.item_name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.location_found?.toLowerCase().includes(term);
      const matchesCategory = !category || item.category === category;
      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) =>
      sortBy === "oldest"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [items, searchTerm, category, sortBy]);

  const initialLoading = loading && !items.length;
  const hasFilters = Boolean(searchTerm || category);

  return (
    <PageShell width="wide">
      <SectionHeader
        eyebrow="FoundIt!"
        tone="found"
        rule
        title="Lost and found"
        description="Most things turn up within a day. Post what you lost, or what you picked up."
        size="h2"
        action={
          <Button leadingIcon={Plus} onClick={() => setFormOpen(true)}>
            Report an item
          </Button>
        }
      />

      {/* Search, category and sort. These controls existed only as unused
          state before — the filter UI had been removed. */}
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="search"
            placeholder="Search by name, description or place"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leadingIcon={Search}
            wrapperClassName="flex-1"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sm:w-44"
            aria-label="Sort order"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </Select>
        </div>

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

      {/* Results. No longer capped at five items. */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Reported</Eyebrow>
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
              <LostItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                canEdit={Boolean(user) && item.user_id === user?.id}
              />
            ))}
          </div>
        ) : hasFilters ? (
          <div className="mt-6">
            <EmptyState
              icon={SearchX}
              title="Nothing matches those filters"
              description="Try a different category, or clear the search."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCategory("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={ImageIcon}
              title="Nothing has been reported yet"
              description="If you have lost something or found something lying around, post it here."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  Report an item
                </Button>
              }
            />
          </div>
        )}
      </section>

      {/* Report / edit form */}
      <Modal
        open={isFormOpen}
        onClose={closeForm}
        size="xl"
        title={isEditMode ? "Edit report" : "Report an item"}
        description={
          isEditMode
            ? "Update the details on this report."
            : "The more specific the location, the faster it gets claimed."
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              {isEditMode ? "Save changes" : "Post report"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            name="item_name"
            label="What is it"
            required
            value={listingItem.item_name}
            onChange={handleInputChange}
            placeholder="e.g. Black Casio calculator"
          />

          <div className="grid gap-5 sm:grid-cols-2">
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

            <Input
              name="location_found"
              label="Where"
              required
              value={listingItem.location_found}
              onChange={handleInputChange}
              placeholder="e.g. Lecture hall 3"
            />
          </div>

          <Input
            name="owner_contact"
            label="Contact number"
            required
            inputMode="numeric"
            value={listingItem.owner_contact}
            onChange={handleInputChange}
            placeholder="10-digit mobile number"
            hint="Shown to whoever wants to return or claim the item."
          />

          <Textarea
            name="description"
            label="Description"
            rows={3}
            value={listingItem.description}
            onChange={handleInputChange}
            placeholder="Any detail that proves ownership — a sticker, a scratch, what was inside."
          />

          <div className="flex flex-col gap-2">
            <span className="text-meta font-medium text-ink-2">Photo</span>

            {listingItem.image_url ? (
              <div className="relative w-fit">
                <img
                  src={listingItem.image_url}
                  alt="Preview"
                  className="h-36 rounded-card border border-line object-cover"
                />
                <IconButton
                  icon={X}
                  label="Remove photo"
                  variant="subtle"
                  size="sm"
                  onClick={clearImage}
                  className="absolute -right-2 -top-2"
                />
              </div>
            ) : null}

            <input
              ref={fileInputRef}
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full cursor-pointer text-meta text-ink-3 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-line-2 file:bg-surface-2 file:px-4 file:py-1.5 file:text-meta file:font-medium file:text-ink hover:file:bg-surface-3"
            />
            <p className="text-micro text-ink-4">Up to 5MB.</p>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default LostAndFound;
