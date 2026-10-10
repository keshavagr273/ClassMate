import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Plus, Send, Sparkles, User, X } from "lucide-react";
import {
  addUserSkill,
  clearError,
  deleteUserSkill,
  fetchMatches,
  fetchSkills,
  fetchUserSkills,
  sendSkillRequest,
} from "../../features/skillExchange/skillExchangeSlice";
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Eyebrow,
  IconButton,
  Input,
  PageShell,
  SectionHeader,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";

/* ------------------------------------------------------------- SkillChip -- */

const SkillChip = ({ name, onDelete }) => (
  <span className="inline-flex items-center gap-1.5 rounded-chip border border-line-2 bg-surface-2 py-1 pl-3 pr-1.5 text-meta text-ink">
    {name}
    {onDelete ? (
      <IconButton
        icon={X}
        label={`Remove ${name}`}
        variant="danger"
        size="sm"
        className="size-6"
        onClick={onDelete}
      />
    ) : (
      <span className="pr-1.5" />
    )}
  </span>
);

/* ------------------------------------------------------------- MatchCard -- */

const MatchCard = ({ match, message, onMessageChange, onSend, sending }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {match.user?.avatar ? (
          <img
            src={match.user.avatar}
            alt=""
            className="size-11 shrink-0 rounded-full border border-line-2 object-cover"
          />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-ink-3">
            <User className="size-5" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-h4 text-ink">
            {match.user?.name || "Unknown student"}
          </p>
          <p className="mt-0.5 truncate text-micro text-ink-4">
            {match.user?.email || "No email"}
          </p>
        </div>

        {match.requestStatus && <Badge tone="positive">Requested</Badge>}
      </div>

      <dl className="flex flex-col gap-1.5 border-t border-line pt-3 text-meta">
        {[
          ["Teaches", match.Skill?.name],
          ["Branch", match.user?.branch],
          ["Semester", match.user?.semester],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-3">
            <dt className="w-20 shrink-0 text-ink-4">{label}</dt>
            <dd className="min-w-0 flex-1 truncate text-ink-2">
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>

      {open && (
        <Textarea
          label="Message"
          rows={2}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Say what you want to learn and when you are free."
        />
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
        {open ? (
          <>
            <Button
              size="sm"
              leadingIcon={Send}
              loading={sending}
              onClick={onSend}
            >
              Send request
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {match.requestStatus ? "Request again" : "Request to connect"}
          </Button>
        )}
      </div>
    </Card>
  );
};

/* ------------------------------------------------- SkillExchangeDashboard -- */

const SkillExchangeDashboard = () => {
  const dispatch = useDispatch();
  const {
    skills = [],
    matches = [],
    userSkills = { teach: [], learn: [] },
    loading,
  } = useSelector((state) => state.skillExchange || {});
  const { isAuthenticated: authIsAuthenticated } = useSelector(
    (state) => state.auth || {}
  );

  const [mode, setMode] = useState("learn");
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);

  /**
   * teachSkills / learnSkills used to be duplicated into local state and kept
   * in sync with Redux by an effect, then written to in two places. They are
   * derived here instead, so there is only one source of truth.
   */
  const teachSkills = useMemo(
    () => (userSkills.teach || []).map((s) => s.Skill?.name || s.name),
    [userSkills]
  );
  const learnSkills = useMemo(
    () => (userSkills.learn || []).map((s) => s.Skill?.name || s.name),
    [userSkills]
  );

  const allAvailableSkills = useMemo(
    () => Array.from(new Set(skills.map((s) => s.name))),
    [skills]
  );

  useEffect(() => {
    if (authIsAuthenticated) {
      dispatch(fetchSkills());
      dispatch(fetchMatches());
      dispatch(fetchUserSkills());
    }
    dispatch(clearError());
  }, [dispatch, authIsAuthenticated]);

  const refreshAll = () => {
    dispatch(fetchSkills());
    dispatch(fetchMatches());
    dispatch(fetchUserSkills());
  };

  const handleAddSkill = async () => {
    const trimmed = skillInput.trim();
    if (!trimmed || isAddingSkill) return;

    if (trimmed.length > 100) {
      toast.error("Keep skill names under 100 characters.");
      return;
    }

    const existing = mode === "learn" ? learnSkills : teachSkills;
    if (existing.includes(trimmed)) {
      toast.error(`"${trimmed}" is already on your ${mode} list.`);
      return;
    }

    setIsAddingSkill(true);
    try {
      const result = await dispatch(
        addUserSkill({ skillName: trimmed, type: mode })
      );
      if (addUserSkill.fulfilled.match(result)) {
        setSkillInput("");
        refreshAll();
        toast.success(
          mode === "learn"
            ? `Looking for someone to teach you ${trimmed}.`
            : `Added ${trimmed} to what you teach.`
        );
      } else {
        toast.error(
          result.payload || result.error?.message || "Could not add that skill."
        );
      }
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleDeleteTeachSkill = async (skillName) => {
    if (!authIsAuthenticated) return;

    const teachSkill = (userSkills.teach || []).find(
      (skill) => (skill.Skill?.name || skill.name) === skillName
    );
    if (!teachSkill) {
      toast.error("Could not find that skill.");
      return;
    }

    setDeletingSkill(skillName);
    try {
      // Goes through the slice now, instead of a raw axios.delete in here.
      await dispatch(deleteUserSkill(teachSkill.id)).unwrap();
      refreshAll();
      toast.success(`Removed ${skillName}.`);
    } catch (err) {
      toast.error(err || "Could not remove that skill.");
    } finally {
      setDeletingSkill(null);
    }
  };

  const handleSendRequest = async (recipientId, skillId) => {
    setSendingTo(`${recipientId}-${skillId}`);
    try {
      const result = await dispatch(
        sendSkillRequest({ recipientId, skillId, message })
      );
      if (sendSkillRequest.fulfilled.match(result)) {
        setMessage("");
        dispatch(fetchMatches());
        toast.success("Request sent.");
      } else {
        toast.error(result.payload || "Could not send that request.");
      }
    } finally {
      setSendingTo(null);
    }
  };

  if (loading && !skills.length) {
    return (
      <PageShell width="wide">
        <div className="flex items-center gap-3 text-ink-3">
          <Spinner size="sm" />
          <span className="text-ui">Loading skill exchange…</span>
        </div>
      </PageShell>
    );
  }

  const currentSkills = mode === "learn" ? learnSkills : teachSkills;

  return (
    <PageShell width="wide">
      <SectionHeader
        eyebrow="SkillSwap"
        tone="skill"
        rule
        title="Peer-to-peer skill exchange"
        description="Say what you want to learn and what you can teach. Matches come from everyone else's lists."
        size="h2"
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Add skills */}
        <div className="lg:col-span-5">
          <Card padding="lg">
            <Eyebrow>Add a skill</Eyebrow>

            <div className="mt-4 flex gap-2">
              <Chip active={mode === "learn"} onClick={() => setMode("learn")}>
                I want to learn
              </Chip>
              <Chip active={mode === "teach"} onClick={() => setMode("teach")}>
                I can teach
              </Chip>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {mode === "learn" ? (
                <Select
                  label="Pick a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                >
                  <option value="">Select a skill</option>
                  {allAvailableSkills.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  label="What can you teach"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. React, guitar, DSA"
                />
              )}

              <Button
                leadingIcon={Plus}
                onClick={handleAddSkill}
                loading={isAddingSkill}
                disabled={!skillInput.trim()}
              >
                Add to my list
              </Button>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <Eyebrow>
                {mode === "learn" ? "Learning" : "Teaching"}
              </Eyebrow>
              {currentSkills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentSkills.map((skill) => (
                    <SkillChip
                      key={`${mode}-${skill}`}
                      name={skill}
                      onDelete={
                        mode === "teach"
                          ? () => handleDeleteTeachSkill(skill)
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-meta text-ink-4">
                  Nothing on this list yet.
                </p>
              )}
              {deletingSkill && (
                <p className="mt-3 flex items-center gap-2 text-micro text-ink-4">
                  <Spinner size="xs" /> Removing {deletingSkill}…
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Matches */}
        <div className="lg:col-span-7">
          <Eyebrow>
            {mode === "learn" ? "Who can teach you" : "Your teaching list"}
          </Eyebrow>

          {mode === "learn" ? (
            matches.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    message={message}
                    onMessageChange={setMessage}
                    sending={
                      sendingTo === `${match.user?.id}-${match.Skill?.id}`
                    }
                    onSend={() =>
                      handleSendRequest(match.user.id, match.Skill.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={Sparkles}
                  title="No matches yet"
                  description="Add a skill you want to learn, and anyone who teaches it will show up here."
                />
              </div>
            )
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={Sparkles}
                title="Matches appear in learn mode"
                description="Switch to “I want to learn” to see who can teach what you are after."
              />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default SkillExchangeDashboard;
