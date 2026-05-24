"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  // DESPESAS
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Casa");

  // RECEITAS
  const [incomeDescription, setIncomeDescription] =
    useState("");

  const [incomeAmount, setIncomeAmount] =
    useState("");

  // LISTAS
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [cardDescription, setCardDescription] =
  useState("");

const [cardAmount, setCardAmount] =
  useState("");

const [installments, setInstallments] =
  useState("1");

const [cardTransactions, setCardTransactions] =
  useState<any[]>([]);

const [totalCard, setTotalCard] =
  useState(0);

  // TOTAIS
  const [totalExpenses, setTotalExpenses] =
    useState(0);

  const [totalIncome, setTotalIncome] =
    useState(0);

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    let {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { data } =
        await supabase.auth.signInAnonymously();

      user = data.user;
    }

    if (user) {
      loadExpenses(user.id);
      loadIncomes(user.id);
      loadCardTransactions(user.id);
    }
  }

  // CARREGAR DESPESAS
  async function loadExpenses(userId: string) {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setExpenses(data);

      const total = data.reduce(
        (acc: number, item: any) =>
          acc + Number(item.amount),
        0
      );

      setTotalExpenses(total);
    }
  }

  // CARREGAR RECEITAS
  async function loadIncomes(userId: string) {
    const { data } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setIncomes(data);

      const total = data.reduce(
        (acc: number, item: any) =>
          acc + Number(item.amount),
        0
      );

      setTotalIncome(total);
    }
  }
  async function loadCardTransactions(
    userId: string
  ) {
    const { data } = await supabase
      .from("card_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });
  
    if (data) {
      setCardTransactions(data);
  
      const total = data.reduce(
        (acc: number, item: any) =>
          acc + Number(item.amount),
        0
      );
  
      setTotalCard(total);
    }
  }

  // ADICIONAR DESPESA
  async function addExpense() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: user.id,
          description,
          amount: Number(amount),
          category,
          date: new Date().toISOString(),
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setDescription("");
    setAmount("");

    loadExpenses(user.id);
  }

  // ADICIONAR RECEITA
  async function addIncome() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    const { error } = await supabase
      .from("incomes")
      .insert([
        {
          user_id: user.id,
          description: incomeDescription,
          amount: Number(incomeAmount),
          date: new Date().toISOString(),
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setIncomeDescription("");
    setIncomeAmount("");

    loadIncomes(user.id);
  }
  async function addCardTransaction() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }
  
    const { error } = await supabase
      .from("card_transactions")
      .insert([
        {
          user_id: user.id,
          description: cardDescription,
          amount: Number(cardAmount),
          installments: Number(installments),
          current_installment: 1,
        },
      ]);
  
    if (error) {
      alert(error.message);
      return;
    }
  
    setCardDescription("");
    setCardAmount("");
    setInstallments("1");
  
    loadCardTransactions(user.id);
  }

  // EXCLUIR DESPESA
  async function deleteExpense(id: string) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      loadExpenses(user.id);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            marginBottom: "20px",
          }}
        >
          Orçamento Familiar 💰
        </h1>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <Card
            title="Receitas"
            value={`R$ ${totalIncome.toFixed(2)}`}
            color="#22c55e"
          />

          <Card
            title="Despesas"
            value={`R$ ${totalExpenses.toFixed(
              2
            )}`}
            color="#ef4444"
          />

          <Card
            title="Saldo"
            value={`R$ ${(
              totalIncome - totalExpenses
            ).toFixed(2)}`}
            color={
              totalIncome - totalExpenses >= 0
                ? "#22c55e"
                : "#ef4444"
            }
          />
        </div>

        {/* RECEITAS */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        >
          <h2>Adicionar Receita</h2>

          <input
            placeholder="Descrição"
            value={incomeDescription}
            onChange={(e) =>
              setIncomeDescription(e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Valor"
            value={incomeAmount}
            onChange={(e) =>
              setIncomeAmount(e.target.value)
            }
            style={inputStyle}
          />

          <button
            onClick={addIncome}
            style={{
              background: "#22c55e",
              color: "white",
              border: "none",
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Adicionar receita
          </button>
        </div>

        {/* DESPESAS */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "30px",
          }}
        >
          <h2>Adicionar Despesa</h2>

          <input
            placeholder="Descrição"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            style={inputStyle}
          />

          <input
            placeholder="Valor"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            style={inputStyle}
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            style={inputStyle}
          >
            <option>Casa</option>
            <option>Mercado</option>
            <option>Lazer</option>
            <option>Saúde</option>
            <option>Transporte</option>
          </select>

          <button
            onClick={addExpense}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Adicionar despesa
          </button>
        </div>
{/* CARTÃO */}

<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "30px",
  }}
>
  <h2>Cartão de Crédito 💳</h2>

  <input
    placeholder="Descrição"
    value={cardDescription}
    onChange={(e) =>
      setCardDescription(e.target.value)
    }
    style={inputStyle}
  />

  <input
    placeholder="Valor"
    value={cardAmount}
    onChange={(e) =>
      setCardAmount(e.target.value)
    }
    style={inputStyle}
  />

  <input
    placeholder="Parcelas"
    value={installments}
    onChange={(e) =>
      setInstallments(e.target.value)
    }
    style={inputStyle}
  />

  <button
    onClick={addCardTransaction}
    style={{
      background: "#4338ca",
      color: "white",
      border: "none",
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "16px",
    }}
  >
    Adicionar compra
  </button>
</div>

{/* LISTA CARTÃO */}

<div
  style={{
    marginBottom: "30px",
  }}
>
  <h2>
    Cartão • Total R${" "}
    {totalCard.toFixed(2)}
  </h2>

  {cardTransactions.length === 0 && (
    <p>Nenhuma compra.</p>
  )}

  {cardTransactions.map((item) => (
    <div
      key={item.id}
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "14px",
        marginBottom: "12px",
      }}
    >
      <strong>{item.description}</strong>

      <p
        style={{
          color: "#4338ca",
        }}
      >
        {item.current_installment}/
        {item.installments}x
      </p>

      <p
        style={{
          color: "#4338ca",
          fontWeight: "bold",
        }}
      >
        R$ {Number(item.amount).toFixed(2)}
      </p>
    </div>
  ))}
</div>

        {/* LISTA RECEITAS */}
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h2>Receitas</h2>

          {incomes.length === 0 && (
            <p>Nenhuma receita.</p>
          )}

          {incomes.map((income) => (
            <div
              key={income.id}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "14px",
                marginBottom: "12px",
              }}
            >
              <strong>
                {income.description}
              </strong>

              <p
                style={{
                  color: "#22c55e",
                  fontWeight: "bold",
                }}
              >
                R${" "}
                {Number(income.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* LISTA DESPESAS */}
        <div>
          <h2>Despesas</h2>

          {expenses.length === 0 && (
            <p>Nenhuma despesa.</p>
          )}

          {expenses.map((expense) => (
            <div
              key={expense.id}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "14px",
                marginBottom: "12px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>
                  {expense.description}
                </strong>

                <p
                  style={{
                    color: "#666",
                  }}
                >
                  {expense.category}
                </p>

                <p
                  style={{
                    color: "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  R${" "}
                  {Number(
                    expense.amount
                  ).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() =>
                  deleteExpense(expense.id)
                }
                style={{
                  background: "#fee2e2",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  color,
}: any) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
      }}
    >
      <p
        style={{
          color: "#666",
          marginBottom: "10px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          color,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "16px",
};