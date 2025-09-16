const Forbidden = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-red-600">403</h1>
      <h2 className="text-2xl mt-4 font-semibold text-gray-800">
        Access Forbidden
      </h2>
      <p className="text-gray-600 mt-2">
        You do not have permission to view this page.
      </p>
      <a
        href="/"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Go Home
      </a>
    </div>
  );
};

export default Forbidden;
