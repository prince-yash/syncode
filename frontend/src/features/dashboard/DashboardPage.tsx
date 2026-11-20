import {
  ArrowRight,
  Bug,
  Clock3,
  Code2,
  Plus,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Surface } from "../../components/ui/Surface";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/shared/EmptyState";
import { PageHeader } from "../../components/shared/PageHeader";
import { leaderboardPreview } from "./mockData";

export function DashboardPage() {
  const [notice, setNotice] = useState("");

  function showPreviewNotice(action: "create" | "join") {
    setNotice(
      action === "create"
        ? "Room creation will be available in a later phase."
        : "Joining rooms will be available in a later phase.",
    );
  }

  return (
    <div className="dashboard-page page-content">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="A good day to solve something."
        description="Your space for the problems worth thinking through together."
        action={
          <Button size="md" onClick={() => showPreviewNotice("create")}>
            <Plus size={17} /> Create a room
          </Button>
        }
      />
      {notice && (
        <p className="action-notice" role="status">
          {notice}
        </p>
      )}

      <section className="dashboard-welcome">
        <div className="dashboard-welcome__copy">
          <span className="dashboard-welcome__icon">
            <Sparkles size={17} />
          </span>
          <div>
            <p className="eyebrow">YOUR NEXT GOOD SESSION</p>
            <h2>Bring a bug. Leave with a better question.</h2>
            <p>Start a shared room and invite someone into the problem.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => showPreviewNotice("create")}
          >
            Start a room <ArrowRight size={15} />
          </Button>
        </div>
        <div className="welcome-code" aria-hidden="true">
          <span>
            <i /> function findTheBug() {"{"}
          </span>
          <span className="welcome-code__indent">
            console.log(<em>"think together"</em>);
          </span>
          <span>{"}"}</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-main-column">
          <Surface as="section" className="dashboard-panel rooms-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent rooms</h2>
                <p>Pick up where your team left off.</p>
              </div>
              <Badge>0 rooms</Badge>
            </div>
            <EmptyState
              icon={<Code2 size={20} />}
              title="Your next room starts here"
              description="No rooms yet. Create one when you’re ready to work through a problem together."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showPreviewNotice("create")}
                >
                  <Plus size={15} /> Create a room
                </Button>
              }
            />
          </Surface>

          <Surface as="section" className="dashboard-panel join-panel">
            <div className="join-panel__icon">
              <Radio size={18} />
            </div>
            <div className="join-panel__copy">
              <h2>Have an invite?</h2>
              <p>Room joining will be available in a later phase.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showPreviewNotice("join")}
            >
              Join a room <ArrowRight size={14} />
            </Button>
          </Surface>

          <Surface as="section" className="dashboard-panel activity-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent activity</h2>
                <p>A little history goes a long way.</p>
              </div>
              <Clock3 size={16} className="panel-heading__icon" />
            </div>
            <EmptyState
              icon={<Clock3 size={19} />}
              title="Nothing on the board yet"
              description="Your shared sessions and milestones will show up here."
            />
          </Surface>
        </section>

        <aside className="dashboard-side-column">
          <Surface as="section" className="dashboard-panel prediction-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">
                  <Bug size={13} /> THE THINKING GAME
                </span>
                <h2>Bug Prediction</h2>
              </div>
              <span className="prediction-mark">
                <Bug size={17} />
              </span>
            </div>
            <p className="prediction-panel__description">
              Call the failing test before the code runs. Compare instincts,
              sharpen your edge.
            </p>
            <div className="prediction-panel__stats">
              <span>
                <strong>01</strong>
                <small>challenge</small>
              </span>
              <span>
                <strong>0</strong>
                <small>your points</small>
              </span>
            </div>
            <div
              className="disabled-feature"
              aria-label="Challenges coming in a later phase"
            >
              <span>Challenges are coming in a later phase</span>
              <span className="disabled-feature__arrow">
                <ArrowRight size={14} />
              </span>
            </div>
          </Surface>

          <Surface as="section" className="dashboard-panel leaderboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">A LITTLE FRIENDLY RIVALRY</p>
                <h2>Leaderboard</h2>
              </div>
              <span className="leaderboard-preview-tag">SAMPLE</span>
            </div>
            <p className="leaderboard-note">Illustrative preview data</p>
            <div className="leaderboard-list">
              {leaderboardPreview.map((entry) => (
                <div className="leaderboard-row" key={entry.rank}>
                  <span className="leaderboard-row__rank">
                    {String(entry.rank).padStart(2, "0")}
                  </span>
                  <Avatar
                    initials={entry.initials}
                    className={`avatar--${entry.tone}`}
                  />
                  <span className="leaderboard-row__name">{entry.name}</span>
                  <strong>
                    {entry.points}
                    <small> pts</small>
                  </strong>
                </div>
              ))}
            </div>
            <div className="leaderboard-footer">
              <Users size={14} /> Scores update when challenges are live.
            </div>
          </Surface>

          <div className="dashboard-aside-note">
            <span className="aside-note-icon">
              <Code2 size={15} />
            </span>
            <span>Made for people who enjoy figuring it out.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
