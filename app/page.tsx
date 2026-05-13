"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const isMobile =
    typeof window !== "undefined" &&
    window.innerWidth < 768;

  // DESPESAS
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState("Casa");

  // RECEITAS
  const [incomeDescription, setIncomeDescription] =
    useState("");

  const [incomeAmount, setIncomeAmount] =
    useState("");

  // CARTÃO
  const [cardDescription, setCardDescription] =
    useState("");

  const [cardAmount, setCardAmount] =
    useState("");

  const [installments, setInstallments] =
    useState("1");

  // LISTAS
  const [expenses, setExpenses] = useState<
    any[]
  >([]);

  const [incomes, setIncomes] = useState<any[]>(
    []
  );

  const [cardExpenses, setCardExpenses] =
    useState<any[]>([]);

  // DATA
  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] =
    useState(
      String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )
    );

  const [selectedYear, setSelectedYear] =
    useState(String(currentDate.getFullYear()));

  // FILTROS
  const filteredExpenses = expenses.filter(
    (expense) => {
      const expenseDate = new Date(expense.date);

      const month = String(
        expenseDate.getMonth() + 1
      ).padStart(2, "0");

      const year = String(
        expenseDate.getFullYear()
      );

      return (
        month === selectedMonth &&
        year === selectedYear
      );
    }
  );

  const filteredIncomes = incomes.filter(
    (income) => {
      const incomeDate = new Date(income.date);

      const month = String(
        incomeDate.getMonth() + 1
      ).padStart(2, "0");

      const year = String(
        incomeDate.getFullYear()
      );

      return (
        month === selectedMonth &&
        year === selectedYear
      );
    }
  );

  const filteredCardExpenses =
    cardExpenses.filter((card) => {
      const cardDate = new Date(
        card.purchase_date
      );

      const month = String(
        cardDate.getMonth() + 1
      ).padStart(2, "0");

      const year = String(
        cardDate.getFullYear()
      );

      return (
        month === selectedMonth &&
        year === selectedYear
      );
    });

  // TOTAIS
  const totalExpenses = filteredExpenses.reduce(
    (total, expense) =>
      total + parseFloat(expense.amount || 0),
    0
  );

  const totalIncomes = filteredIncomes.reduce(
    (total, income) =>
      total + parseFloat(income.amount || 0),
    0
  );

  const totalCardExpenses =
    filteredCardExpenses.reduce(
      (total, card) =>
        total + parseFloat(card.amount || 0),
      0
    );

  const balance =
    totalIncomes -
    totalExpenses -
    totalCardExpenses;

  // GRAFICO
  const categoryTotals: any = {};

  filteredExpenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }

    categoryTotals[expense.category] +=
      parseFloat(expense.amount);
  });

  const chartData = Object.keys(
    categoryTotals
  ).map((category) => ({
    name: category,
    value: categoryTotals[category],
  }));

  const COLORS = [
    "#ef5350",
    "#42a5f5",
    "#66bb6a",
    "#ffa726",
    "#ab47bc",
    "#26c6da",
  ];

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
  
    console.log("USER:", user);
    console.log("ERROR:", error);
  
    if (user) {
      setUser(user);
  
      loadExpenses(user.id);
      loadIncomes(user.id);
      loadCardExpenses();
    } else {
      alert("Usuário não autenticado");
    }
  }}

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

  async function loadIncomes(userId: string) {
    const { data: memberData } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!memberData) return;

    const { data } = await supabase
      .from("incomes")
      .select("*")
      .eq("family_id", memberData.family_id)
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setIncomes(data);
    }
  }

  async function loadCardExpenses() {
    const { data } = await supabase
      .from("card_transactions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setCardExpenses(data);
    }
  }

  async function deleteExpense(id: string) {
    const confirmDelete = confirm(
      "Deseja excluir esta despesa?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      if (user) {
        loadExpenses(user.id);
      }
    }
  }

  async function addExpense() {
    alert("FUNÇÃO EXECUTOU");
    if (!user) {
      alert("Usuário não encontrado");
      return;
    }
  
    const { data: memberData, error: memberError } =
      await supabase
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

  async function addIncome() {
    if (!user) return;

    const { data: memberData } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!memberData) return;

    const { error } = await supabase
      .from("incomes")
      .insert([
        {
          family_id: memberData.family_id,
          user_id: user.id,
          description: incomeDescription,
          amount: incomeAmount,
          date: new Date(),
        },
      ]);

    if (error) {
      alert(error.message);
    } else {
      setIncomeDescription("");
      setIncomeAmount("");

      loadIncomes(user.id);
    }
  }

  async function addCardExpense() {
    if (!user) return;

    const { error } = await supabase
      .from("card_transactions")
      .insert([
        {
          description: cardDescription,
          amount: cardAmount,
          installments,
          current_installment: 1,
          purchase_date: new Date(),
        },
      ]);

    if (error) {
      alert(error.message);
    } else {
      setCardDescription("");
      setCardAmount("");
      setInstallments("1");

      loadCardExpenses();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: isMobile ? "20px" : "40px",
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
            fontSize: isMobile
              ? "28px"
              : "36px",
            marginBottom: "20px",
          }}
        >
          Orçamento Familiar 💰
        </h1>

        {/* FILTRO */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile
              ? "column"
              : "row",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
            style={inputStyle}
          >
            <option value="01">
              Janeiro
            </option>
            <option value="02">
              Fevereiro
            </option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">
              Setembro
            </option>
            <option value="10">
              Outubro
            </option>
            <option value="11">
              Novembro
            </option>
            <option value="12">
              Dezembro
            </option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(e.target.value)
            }
            style={inputStyle}
          >
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
        </div>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {[
            {
              title: "Receitas",
              value: totalIncomes,
              color: "green",
            },
            {
              title: "Despesas",
              value: totalExpenses,
              color: "red",
            },
            {
              title: "Cartão",
              value: totalCardExpenses,
              color: "#3949ab",
            },
            {
              title: "Saldo",
              value: balance,
              color:
                balance >= 0
                  ? "green"
                  : "red",
            },
          ].map((card, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{card.title}</h3>

              <p
                style={{
                  color: card.color,
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                R$ {card.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* FORMULÁRIOS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "1fr 1fr",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* DESPESAS */}
          <div
            style={cardStyle}
          >
            <h2>
              Adicionar Despesa
            </h2>

            <input
              placeholder="Descrição"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
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
              <option>
                Transporte
              </option>
              <option>Lazer</option>
              <option>Saúde</option>
            </select>

            <button
  onClick={addExpense}
  style={{
    ...buttonStyle,
    background: "#e53935",
  }}
>
  Adicionar despesa
</button>
          </div>

          {/* RECEITAS */}
          <div
            style={cardStyle}
          >
            <h2>
              Adicionar Receita
            </h2>

            <input
              placeholder="Descrição"
              value={incomeDescription}
              onChange={(e) =>
                setIncomeDescription(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              placeholder="Valor"
              value={incomeAmount}
              onChange={(e) =>
                setIncomeAmount(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <button
              onClick={addIncome}
              style={{
                ...buttonStyle,
                background: "#43a047",
              }}
            >
              Adicionar receita
            </button>
          </div>
        </div>

        {/* CARTÃO */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "30px",
          }}
        >
          <h2>
            Cartão de Crédito 💳
          </h2>

          <input
            placeholder="Descrição"
            value={cardDescription}
            onChange={(e) =>
              setCardDescription(
                e.target.value
              )
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
              setInstallments(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <button
            onClick={addCardExpense}
            style={{
              ...buttonStyle,
              background: "#3949ab",
            }}
          >
            Adicionar compra
          </button>
        </div>

        {/* GRAFICO */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "30px",
          }}
        >
          <h2>
            Gastos por Categoria
          </h2>

          <div
            style={{
              width: "100%",
              height: 300,
            }}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {chartData.map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LISTA */}
        <div>
          <h2
            style={{
              marginBottom: "15px",
            }}
          >
            Despesas
          </h2>

          {filteredExpenses.map(
            (expense) => (
              <div
  style={{
    marginTop: "30px",
  }}
>
  <h2
    style={{
      marginBottom: "15px",
    }}
  >
    Despesas
  </h2>

  {filteredExpenses.length === 0 && (
    <p>Nenhuma despesa encontrada.</p>
  )}

  {filteredExpenses.map((expense) => (
    <div
      key={expense.id}
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <strong>{expense.description}</strong>

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
              >
                <div>
                  <strong>
                    {
                      expense.description
                    }
                  </strong>

                  <p
                    style={{
                      color: "#666",
                    }}
                  >
                    {
                      expense.category
                    }
                  </p>

                  <p
                    style={{
                      color:
                        "#e53935",
                      fontWeight:
                        "bold",
                    }}
                  >
                    R$ {expense.amount}
                  </p>
                </div>

                <button
                  onClick={() =>
                    deleteExpense(
                      expense.id
                    )
                  }
                  style={{
                    background:
                      "#ffebee",
                    border: "none",
                    color: "#e53935",
                    padding: "10px",
                    borderRadius:
                      "10px",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "12px",
  width: "100%",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "12px",
  width: "100%",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};