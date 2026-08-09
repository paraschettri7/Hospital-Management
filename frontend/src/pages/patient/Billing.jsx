import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { billingApi } from "../../api/resources";
import { apiErrorMessage } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";
import StatusPill from "../../components/StatusPill";

export default function Billing() {
  const { user } = useAuth();
  const { data: bills, loading, error, refetch } = useAsync(
    () => billingApi.list(user.id),
    [user.id]
  );
  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState("");

  if (loading) return <LoadingScreen label="Loading bills" />;

  async function handlePay(id) {
    setPayError("");
    setPayingId(id);
    try {
      await billingApi.pay(id);
      refetch();
    } catch (err) {
      setPayError(apiErrorMessage(err));
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Statements</span>
            <h1>Billing</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {payError && <div className="form-error">{payError}</div>}

        {(!bills || bills.length === 0) && <div className="empty-state card">No bills on file.</div>}

        <div className="grid" style={{ gap: "1rem" }}>
          {(bills || []).map((bill) => (
            <div className="card" key={bill._id}>
              <div className="card-title-row">
                <h3 className="mt-0">
                  ${bill.totalAmount.toFixed(2)}{" "}
                  <span className="text-soft" style={{ fontWeight: 400, fontSize: "0.85rem" }}>
                    · issued {new Date(bill.issuedAt).toLocaleDateString()}
                  </span>
                </h3>
                <StatusPill status={bill.status} />
              </div>
              <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", color: "var(--ink-soft)" }}>
                {bill.items.map((item, i) => (
                  <li key={i}>
                    {item.description}: ${item.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
              {bill.status === "unpaid" && (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={payingId === bill._id}
                  onClick={() => handlePay(bill._id)}
                >
                  {payingId === bill._id ? "Processing…" : "Pay now"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
