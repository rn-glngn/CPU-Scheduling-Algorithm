# 💻 CPU Scheduling Algorithm Simulation/Visualizer

**An interactive web application to visualize and simulate various CPU scheduling algorithms.**

[Live Demonstration](https://rn-glngn.github.io/CPU-Scheduling-Algorithm/)

## 📖 Overview

This project provides a straightforward and intuitive web-based tool for understanding the fundamental concepts of CPU scheduling. It allows users to simulate and visualize the execution of different scheduling algorithms, such as First-Come, First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin. Designed for educational purposes, it helps users grasp how processes are managed by the CPU and analyze performance metrics like waiting time and turnaround time.

## ✨ Features

- 🎯 **Multiple Algorithms**: Simulate various CPU scheduling algorithms.
- 📊 **Gantt Chart Visualization**: Visually represent process execution timelines.
- 📈 **Performance Metrics**: Calculate and display average waiting time and average turnaround time.
- 🔢 **Dynamic Process Input**: Add and configure processes with arrival time, burst time, and priority.
- 🖱️ **Interactive Interface**: User-friendly controls for running, resetting, and stepping through simulations.

## 🖥️ Screenshots

![Sample-Screenshot](assets\CPU-Scheduling-Algorithm.png)

## 🛠️ Tech Stack

**Frontend:**

- **HTML5**
- **CSS3**
- **JavaScript**

## 🚀 Quick Start

This project is a static web application that runs directly in your browser.

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge, Safari).

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/rn-glngn/CPU-Scheduling-Algorithm.git
    cd CPU-Scheduling-Algorithm
    ```

2.  **Open in browser**
    Simply open the `index.html` file in your preferred web browser.
    ```bash
    # Example for macOS (might vary by OS)
    open index.html
    ```

## 📁 Project Structure

```
CPU-Scheduling-Algorithm/
├── globals.css        # Global CSS styles
├── index.html         # Main application entry point (HTML structure)
├── js/                # JavaScript files for logic and interactivity
│   ├── [algorithm-logic-files].js # Individual algorithm implementations
│   └── [main-app-logic].js        # Core application logic, UI interactions
├── style.css          # Specific styling for the application's components
└── README.md          # This README file
```

## 🔧 Development

To make changes or extend the functionality:

1.  Modify the HTML structure in `index.html`.
2.  Update the styling in `style.css` or `globals.css`.
3.  Implement or enhance scheduling algorithms and UI logic within the `js/` directory.

## 🚀 Deployment

This project is designed to be easily deployed as a static website. It is currently hosted on GitHub Pages:

- **GitHub Pages**: The application is deployed directly from the `main` branch to [https://rn-glngn.github.io/CPU-Scheduling-Algorithm/](https://rn-glngn.github.io/CPU-Scheduling-Algorithm/).

## 🤝 Contributing

If you have suggestions for new features, improvements, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.
