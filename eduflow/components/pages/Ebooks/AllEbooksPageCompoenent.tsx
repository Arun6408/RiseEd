"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { getRole, handleUpload, setToken } from "@/utils/util";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
  useModal,
} from "@/components/ui/animated-modal";
import Loader from "@/components/utils/Loader";

type Ebook = {
  id: number;
  title: string;
  name: string;
  description: string;
  genre: string;
  fileUrl: string;
  uploadDate: string;
};

const AllEbooksPageComponent = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [ebookTitle, setEbookTitle] = useState<string>("");
  const [ebookDescription, setEbookDescription] = useState<string>("");
  const [ebookGenre, setEbookGenre] = useState<string>("");
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<string|null>(null);
  
  const fetchBooks = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/ebooks`;
      setToken();
      const { data } = await axios.get(url);
      setEbooks(data.data);
    } catch (error) {
      console.error("Error Occurred: ", error);
    }
  };
  
  useEffect(() => {
    fetchBooks();
    setRole(getRole());
  }, [ebooks]);

  const handleDelete = async (ebookId: number) => {
    if (window.confirm("Are you sure you want to delete this eBook?")) {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/ebooks/${ebookId}`;
        setToken();
        await axios.delete(url);
        setEbooks((prev) => prev.filter((ebook) => ebook.id !== ebookId));
        alert("Ebook deleted successfully.");
      } catch (error) {
        console.error("Error deleting eBook: ", error);
        alert("Failed to delete the eBook. Please try again.");
      }
    }
  };

  async function handleAddEbook() {
    setLoading(true);
    let fileUrl;
    try {
      if (ebookFile) {
        fileUrl = await handleUpload(ebookFile, null);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error uploading file: ", error);
      alert("Failed to create eBook. Please try again.");
      return false;
    }
    const newEbook = {
      title: ebookTitle,
      description: ebookDescription,
      genre: ebookGenre,
      fileUrl,
    };

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/ebooks`;
      setToken();
      await axios.post(url, newEbook);
      clearForm();
      fetchBooks();
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Error adding eBook: ", error);
      alert("Failed to create eBook. Please try again.");
      return false;
    }
  }

  const clearForm = () => {
    setEbookTitle("");
    setEbookDescription("");
    setEbookGenre("");
    setEbookFile(null);
  };
  return (
    <div>
        {loading && <Loader/>}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 min-h-screen p-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent drop-shadow-lg">
          Welcome to Your E-Book Library
        </h1>
        <p className="text-lg text-teal-600 mt-4 max-w-3xl mx-auto">
          Dive into a curated collection of eBooks across genres, beautifully
          crafted for your learning journey.
        </p>
        {role != "student" && (
          <Modal>
            <ModalTrigger className="mt-6 bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-teal-700 transition-all">
              Add New Ebook
            </ModalTrigger>
            <ModalBody>
              <form action="">
                <ModalContent>
                  <div className="flex flex-col justify-start items-start gap-4">
                    <div className="flex gap-4 justify-evenly w-full">
                      <div className="flex flex-col gap-2 justify-start items-start w-full">
                        <label htmlFor="ebookTitle" className="">
                          Ebook Title:
                          <span className="text-red-500 text-lg">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Ebook title.."
                          className="border-2 rounded-md border-gray-500 px-4 py-1 focus:border-black w-full"
                          id="ebookTitle"
                          value={ebookTitle}
                          onChange={(e) => setEbookTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2 justify-start items-start w-full">
                        <label htmlFor="ebookDescription" className="">
                          Ebook description:
                          <span className="text-red-500 text-lg">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Ebook description.."
                          className="border-2 rounded-md border-gray-500 px-4 py-1 focus:border-black w-full"
                          id="ebookDescription"
                          value={ebookDescription}
                          onChange={(e) => setEbookDescription(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2 justify-start items-start w-full">
                        <label htmlFor="ebookGenre" className="">
                          Ebook genre:
                          <span className="text-red-500 text-lg">*</span>
                        </label>
                        <div className="relative w-full">
                          <select
                            id="ebookGenre"
                            className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={ebookGenre}
                            required
                            onChange={(e) => setEbookGenre(e.target.value)}
                          >
                            <option value="" disabled>
                              Choose an option
                            </option>
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Science">Science</option>
                            <option value="Technology">Technology</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Health">Health</option>
                            <option value="Education">Education</option>
                            <option value="Biography">Biography</option>
                            <option value="Travel">Travel</option>
                            <option value="History">History</option>
                          </select>

                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 items-start justify-start">
                      <label htmlFor="ebookFile" className="">
                        Upload Ebook:
                        <span className="text-red-500 text-lg">*</span>
                      </label>
                      <input
                        type="file"
                        name=""
                        id="ebookFile"
                        onChange={(e) =>
                          setEbookFile(e.target.files && e.target.files[0])
                        }
                        required
                      />
                    </div>
                  </div>
                </ModalContent>
                <ModalFooter className="gap-4">
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                  <button
                    className=" text-white  text-sm px-2 py-1 rounded-md border border-teal-600 bg-teal-500 hover:bg-teal-600 w-28"
                    type="button"
                    onClick={handleAddEbook}
                  >
                    Add Course
                  </button>
                </ModalFooter>
              </form>
            </ModalBody>
          </Modal>
        )}
      </div>

      {/* Ebook Grid */}
      {ebooks.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-xl font-medium text-teal-600">
            No eBooks available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="relative bg-white border border-teal-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transform transition-all"
            >
              {/* Ebook Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-teal-700 mb-2">
                  {ebook.title}
                </h2>
                <p className="text-sm text-teal-500 mb-4">By: {ebook.name}</p>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {ebook.description}
                </p>
                <p className="text-sm text-teal-600 mb-2">
                  Genre: {ebook.genre}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Uploaded: {new Date(ebook.uploadDate).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    {role != "student" && (
                      <button
                        onClick={() => handleDelete(ebook.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <a
                    href={ebook.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-all"
                  >
                    View
                  </a>
                </div>
              </div>
              {/* Decorative Bottom Border */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-teal-600"></div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default AllEbooksPageComponent;
