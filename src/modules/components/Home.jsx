import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Home() {
  const [sideData, setSideData] = useState({ customers: [], transactions: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchData = async () => {
    const res = await axios.get('/sideData.json');
    setSideData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const transactionsByCustomer = sideData.customers.map(customer => {
    const customerTransactions = sideData.transactions.filter(
      transaction => transaction.customer_id === customer.id
    );

    return { ...customer, transactions: customerTransactions };
   
  });

  const filteredData = transactionsByCustomer.filter(customer => {
    const isNameMatch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isTransactionMatch = customer.transactions.some(transaction =>
      transaction.amount.toString().includes(searchTerm)
    );
    return isNameMatch || isTransactionMatch;
  });


  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const transactionAmountsByDate = selectedCustomer?.transactions.reduce((acc, transaction) => {
    acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
    return acc;
  }, {});

  const chartData = {
    labels: transactionAmountsByDate ? Object.keys(transactionAmountsByDate) : [],
    datasets: [
      {
        label: 'Total Transaction Amount',
        data: transactionAmountsByDate ? Object.values(transactionAmountsByDate) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="container mt-5 custom-container">
        <div className="data w-75 m-auto">
          <input
            id="search"
            className="form-control mb-5 mt-5 w-50 m-auto text-center"
            placeholder="Search by Name or Transaction Amount"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <table id="table" className="table table-hover table-bordered text-center custom-table">
            <thead className="thead-dark">
              <tr>
                <th>Customer Name</th>
                <th>Transaction Date</th>
                <th>Transaction Amount</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {filteredData.map((customer, index) => (
                <React.Fragment key={index}>
                  {customer.transactions.map((transaction, tIndex) => (
                    <tr key={transaction.id} onClick={() => handleCustomerSelect(customer)}>
                      <td className="align-middle">{tIndex === 0 ? customer.name : ''}</td>
                      <td className="align-middle">{transaction.date}</td>
                      <td className="align-middle">{transaction.amount}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {selectedCustomer && (
          <div className="chart w-75 m-auto mt-5">
            <h3 className="text-center">Total Transaction Amount per Day for {selectedCustomer.name}</h3>
            <Bar data={chartData} />
          </div>
        )}
      </div>
    </>
  );
}
