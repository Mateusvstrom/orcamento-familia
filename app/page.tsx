"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {

  async function loginAnonimo() {
    const { data, error } =
       
    if (data.user) {
      setUser(data.user);
      loadExpenses(data.user.id);
    }
  
    if (error) {
      console.log(error);
    }
  }
  await supabase.auth.signInAnonymously();
  
}

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Casa");

  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(user);

    if (user) {
      setUser(user);
      loadExpenses(user.id);
    } else {
      await loginAnonimo();
    }
  }

  async function loadExpenses(userId: string) {
    const { data: memberData } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!memberData) return;

    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("family_id", memberData.family_id)
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setExpenses(data);
    }
  }

  async function addExpense() {
    alert("FUNÇÃO EXECUTOU");

    if (!user) {
      alert("Usuário não encontrado");
      return;
    }

    const {
      data: memberData,
      error: memberError,
    } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (memberError || !memberData) {
      alert("Erro ao localizar família");
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .insert([
        {
          family_id: memberData.family_id,
          user_id: user.id,
          description,
          amount: Number(amount),
          category,
          date: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      setDescription("");
      setAmount("");

      loadExpenses(user.id);
    }
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
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
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1>Orçamento Familiar 💰</h1>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginTop: "20px",
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
          </select>

          <button
            onClick={addExpense}
            style={{
              background: "#e53935",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Adicionar despesa
          </button>
        </div>

        <div
          style={{
            marginTop: "30px",
          }}
        >
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
                borderRadius: "12px",
                marginBottom: "10px",
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

                <p>{expense.category}</p>

                <p
                  style={{
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  R$ {expense.amount}
                </p>
              </div>

              <button
                onClick={() =>
                  deleteExpense(expense.id)
                }
                style={{
                  background: "#ffebee",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
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

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};