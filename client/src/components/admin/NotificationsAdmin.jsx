import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BellOff, Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  broadcastNotification,
  createNotification,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../slices/notificationSlice";
import { fetchAllUsers } from "../../slices/authSlice";
import ErrorDisplay from "../../utils/ErrorDisplay";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  IconButton,
  SectionHeader,
  Select,
  Switch,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
} from "../ui";

const LIMIT = 15;

const types = ["general", "system", "alert", "update", "event"];

const toneForType = (type) =>
  type === "alert" ? "critical" : type === "system" ? "caution" : "neutral";

const NotificationsAdmin = () => {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    type: "general",
    file: null,
    userId: "",
  });

  const {
    notifications = [],
    loading: loadingNotifications,
    error: errorNotifications,
    totalPages = 0,
  } = useSelector((state) => state.notifications) || {};

  const { allUsers = [] } = useSelector((state) => state.auth) || {};

  useEffect(() => {
    dispatch(getNotifications({ page: currentPage, limit: LIMIT }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  }, []);

  const resetForm = () => {
    setFormData({ message: "", type: "general", file: null, userId: "" });
    formRef.current?.reset();
    setIsBroadcast(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error("The message cannot be empty.");
      return;
    }
    if (!isBroadcast && !formData.userId) {
      toast.error("Pick a recipient, or turn on broadcast.");
      return;
    }

    const payload = new FormData();
    payload.append("message", formData.message);
    payload.append("type", formData.type);
    if (formData.file) payload.append("file", formData.file);

    let actionToDispatch;
    let loadingToastId;

    if (isBroadcast) {
      payload.append("entityType", "broadcast");
      actionToDispatch = broadcastNotification(payload);
      loadingToastId = toast.loading("Broadcasting…");
    } else {
      payload.append("userId", formData.userId);
      actionToDispatch = createNotification(payload);
      loadingToastId = toast.loading("Sending…");
    }

    setSubmitting(true);
    try {
      await dispatch(actionToDispatch).unwrap();
      toast.success(isBroadcast ? "Broadcast sent." : "Notification sent.", {
        id: loadingToastId,
      });
      resetForm();
      if (currentPage !== 1) setCurrentPage(1);
      else dispatch(getNotifications({ page: 1, limit: LIMIT }));
    } catch (err) {
      toast.error(`Could not send that. ${err?.message || ""}`.trim(), {
        id: loadingToastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this notification?")) return;
      const loadingToastId = toast.loading("Deleting…");
      try {
        await dispatch(deleteNotification(id)).unwrap();
        toast.success("Deleted.", { id: loadingToastId });
        dispatch(getNotifications({ page: currentPage, limit: LIMIT }));
        if (notifications.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (err) {
        toast.error(`Could not delete that. ${err?.message || ""}`.trim(), {
          id: loadingToastId,
        });
      }
    },
    [dispatch, currentPage, notifications.length]
  );

  const handleMarkAsRead = useCallback(
    async (id) => {
      const loadingToastId = toast.loading("Marking as read…");
      try {
        await dispatch(markNotificationAsRead(id)).unwrap();
        toast.success("Marked as read.", { id: loadingToastId });
      } catch (err) {
        toast.error(`Could not mark that. ${err?.message || ""}`.trim(), {
          id: loadingToastId,
        });
      }
    },
    [dispatch]
  );

  const handleMarkAllAdminAsRead = useCallback(async () => {
    if (!window.confirm("Mark everything listed here as read?")) return;
    const loadingToastId = toast.loading("Marking all as read…");
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success("All marked as read.", { id: loadingToastId });
    } catch (err) {
      toast.error(`Could not mark those. ${err?.message || ""}`.trim(), {
        id: loadingToastId,
      });
    }
  }, [dispatch]);

  return (
    <div>
      <SectionHeader
        eyebrow="Notifications"
        title="Send a notification"
        description="To one student, or to everyone at once."
        size="h2"
      />

      {/* Compose */}
      <Card padding="lg" className="mt-8">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Textarea
            name="message"
            label="Message"
            required
            rows={3}
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Keep it short and specific — this appears in the nav bell."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              name="type"
              label="Type"
              value={formData.type}
              onChange={handleInputChange}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>

            <Select
              name="userId"
              label="Recipient"
              value={formData.userId}
              onChange={handleInputChange}
              disabled={isBroadcast}
              hint={isBroadcast ? "Broadcast goes to everyone." : undefined}
            >
              <option value="">Select a student</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email} — {user.id}
                </option>
              ))}
            </Select>
          </div>

          {/* Replaces a ~400-character hand-rolled peer/after: toggle. */}
          <Switch
            checked={isBroadcast}
            onChange={(next) => {
              setIsBroadcast(next);
              setFormData((prev) => ({ ...prev, userId: "" }));
            }}
            label="Broadcast to everyone"
            description="Ignores the recipient field and sends to every account."
          />

          <div className="flex flex-col gap-2">
            <span className="text-meta font-medium text-ink-2">
              Attachment
            </span>
            <input
              name="file"
              type="file"
              onChange={handleFileChange}
              className="w-full cursor-pointer text-meta text-ink-3 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-line-2 file:bg-surface-2 file:px-4 file:py-1.5 file:text-meta file:font-medium file:text-ink hover:file:bg-surface-3"
            />
            <p className="text-micro text-ink-4">Optional.</p>
          </div>

          <div className="flex justify-end border-t border-line pt-5">
            <Button type="submit" loading={submitting}>
              {isBroadcast ? "Send broadcast" : "Send notification"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Sent list */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Eyebrow>Sent</Eyebrow>
          <Button variant="ghost" size="sm" onClick={handleMarkAllAdminAsRead}>
            Mark all read
          </Button>
        </div>

        {errorNotifications && (
          <div className="mt-4">
            <ErrorDisplay
              error={errorNotifications}
              onRetry={() =>
                dispatch(getNotifications({ page: currentPage, limit: LIMIT }))
              }
              messagePrefix="Notifications: "
            />
          </div>
        )}

        <div className="mt-6">
          {loadingNotifications && !notifications.length ? (
            <p className="text-ui text-ink-4">Loading…</p>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="Nothing sent yet"
              description="Notifications you send will be listed here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Message</TH>
                  <TH>Type</TH>
                  <TH>Status</TH>
                  <TH>Sent</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {notifications.map((notif) => (
                  <TR key={notif.id} interactive>
                    <TD className="max-w-md text-ink">
                      <span className="line-clamp-2">{notif.message}</span>
                    </TD>
                    <TD>
                      <Badge tone={toneForType(notif.type)}>
                        {notif.type || "general"}
                      </Badge>
                    </TD>
                    <TD>
                      {notif.is_read ? (
                        <span className="text-ink-4">Read</span>
                      ) : (
                        <Badge tone="accent">Unread</Badge>
                      )}
                    </TD>
                    <TD className="whitespace-nowrap">
                      <time>
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleDateString()
                          : "—"}
                      </time>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-0.5">
                        {!notif.is_read && (
                          <IconButton
                            icon={Check}
                            label="Mark as read"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif.id)}
                          />
                        )}
                        <IconButton
                          icon={Trash2}
                          label="Delete notification"
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(notif.id)}
                        />
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              leadingIcon={ChevronLeft}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="numeric text-meta text-ink-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              trailingIcon={ChevronRight}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsAdmin;
