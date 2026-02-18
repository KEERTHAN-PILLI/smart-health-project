import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

function Dashboard() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Calories Burned",
        data: [200, 300, 250, 400, 350],
        borderColor: "#00c6ff",
      },
    ],
  };

  return (
    <div className="glass">
      <h2>Weekly Progress</h2>
      <Line data={data} />
    </div>
  );
}

export default Dashboard;
