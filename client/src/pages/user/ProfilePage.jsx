import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { AlertCircle, LogOut, Pencil, User, X } from "lucide-react";
import {
  clearError,
  getUser,
  setIsEditing,
  updateUser,
} from "../../slices/profileSlice";
import { handleLogout as handleLogoutThunk } from "../../slices/authSlice";
import LoadingScreen from "../../components/common/loading";
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Input,
  PageShell,
  SectionHeader,
  Select,
} from "../../components/ui";

const branchOptions = [
  "Electronics and Communication Engineering",
  "Computer Science Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Engineering and Computational Mechanics",
  "Chemical Engineering",
  "Material Engineering",
  "Production and Industrial Engineering",
  "Biotechnology",
];

const semesterOptions = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
];

const hostelOptions = [
  "CECT Hostel",
  "Coho Hostel",
  "Supermax Flats",
  "Tdi flats",
];

const emptyProfile = {
  name: "",
  email: "",
  branch: "",
  semester: "",
  graduation_year: 2025,
  hostel: "",
};

const fromUser = (user) => ({
  name: user.name || "",
  email: user.email || "",
  branch: user.branch || "",
  semester: user.semester || "",
  graduation_year: user.graduation_year || 2025,
  hostel: user.hostel || "",
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isEditing, loading, error } = useSelector(
    (state) => state.profile
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(emptyProfile);

  /**
   * There used to be two edit flags: Redux `isEditing` (selected but only ever
   * set to false) and a local `editMode` (what the UI actually read). Redux is
   * now the single source of truth, so Save/Cancel and any other dispatcher
   * agree on one value.
   */
  useEffect(() => {
    if (isAuthenticated) dispatch(getUser());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (user) setUserData(fromUser(user));
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    dispatch(setIsEditing(false));
    // Restores every field. The old version omitted graduation_year, so a
    // cancelled edit left that value dirty.
    if (user) setUserData(fromUser(user));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      await dispatch(
        updateUser({
          name: userData.name,
          branch: userData.branch,
          semester: userData.semester,
          hostel: userData.hostel,
        })
      ).unwrap();
      dispatch(setIsEditing(false));
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.message || err || "Could not update your profile.");
    }
  };

  const handleLogoutClick = async () => {
    try {
      await dispatch(handleLogoutThunk()).unwrap();
      navigate("/login");
    } catch {
      toast.error("Could not sign you out. Try again.");
    }
  };

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          icon={AlertCircle}
          tone="critical"
          title="We could not load your profile"
          description="Your session may have expired. Signing in again usually fixes it."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              Go to sign in
            </Button>
          }
        />
      </PageShell>
    );
  }

  const details = [
    ["Registration number", user.registration_number],
    ["Email", userData.email],
    ["Branch", userData.branch],
    ["Semester", userData.semester],
    ["Hostel", userData.hostel],
    ["Graduating", userData.graduation_year],
  ];

  return (
    <PageShell width="wide">
      <SectionHeader
        eyebrow="Account"
        title="Your profile"
        size="h2"
        action={
          !isEditing ? (
            <Button
              variant="outline"
              leadingIcon={Pencil}
              onClick={() => dispatch(setIsEditing(true))}
            >
              Edit
            </Button>
          ) : null
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Identity */}
        <aside className="lg:col-span-4">
          <Card padding="lg" className="flex flex-col items-start gap-5">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="size-20 rounded-full border border-line-2 object-cover"
              />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-ink-3">
                <User className="size-7" aria-hidden />
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-h3 text-ink">
                {userData.name || "Unnamed student"}
              </p>
              <p className="mt-1 truncate text-meta text-ink-4">
                {userData.email}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leadingIcon={LogOut}
              onClick={handleLogoutClick}
              className="-ml-3 mt-2"
            >
              Sign out
            </Button>
          </Card>
        </aside>

        {/* Details, or the edit form */}
        <div className="lg:col-span-8">
          {isEditing ? (
            <Card padding="lg">
              <Eyebrow>Editing</Eyebrow>
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
                <Input
                  name="name"
                  label="Full name"
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="As it appears on institute records"
                />

                <Select
                  name="branch"
                  label="Branch"
                  value={userData.branch}
                  onChange={handleChange}
                >
                  <option value="">Select a branch</option>
                  {branchOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    name="semester"
                    label="Semester"
                    value={userData.semester}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {semesterOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>

                  <Select
                    name="hostel"
                    label="Hostel"
                    value={userData.hostel}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {hostelOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    leadingIcon={X}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save changes
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <>
              <Eyebrow>Details</Eyebrow>
              <dl className="mt-4 border-t border-line">
                {details.map(([term, value]) => (
                  <div
                    key={term}
                    className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-6"
                  >
                    <dt className="text-meta text-ink-4">{term}</dt>
                    <dd className="text-ui text-ink">
                      {value || <span className="text-ink-4">Not set</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
