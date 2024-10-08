"use client";

import React, { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import CategoryBadge from "@/components/ui/badge/CategoryBadge";
import Pagination from "@/components/ui/Pagination";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import { ArrowUpDown, Trash } from "lucide-react";

import { AllScore } from "@/types/score";
import { deleteScore, getAllScore } from "@/lib/scoreApi";
import { thDateTime } from "@/lib/format";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";

export default function ScorePage() {
	const [data, setData] = useState<AllScore[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const itemsPerPage: number = 10;

	const [action, setAction] = useState<boolean>(false);

	const [searchTerm, setSearchTerm] = useState<string>("");
	const [sortConfig, setSortConfig] = useState<{
		key: keyof AllScore;
		direction: "asc" | "desc";
	} | null>(null);

	useEffect(() => {
		window.scrollTo(0, 0);
		getScore();
	}, [action]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [currentPage]);

	async function getScore() {
		setIsLoading(true);
		const scoreData = await getAllScore();
		setData(scoreData ?? []);
		setIsLoading(false);
	}

	const filteredData = data.filter((item) =>
		Object.values(item).some((value) =>
			value.toString().toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	const sortedData = React.useMemo(() => {
		let sortableItems = [...filteredData];
		if (sortConfig !== null) {
			sortableItems.sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key]) {
					return sortConfig.direction === "asc" ? -1 : 1;
				}
				if (a[sortConfig.key] > b[sortConfig.key]) {
					return sortConfig.direction === "asc" ? 1 : -1;
				}
				return 0;
			});
		}
		return sortableItems;
	}, [filteredData, sortConfig]);

	const totalPages = Math.ceil(sortedData.length / itemsPerPage);
	const paginatedData = sortedData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const requestSort = (key: keyof AllScore) => {
		let direction: "asc" | "desc" = "asc";
		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	async function handleDelete(scoreId: string) {
		const message = await deleteScore(scoreId);
		setAction(!action);
	}

	return (
		<div className="flex flex-col items-center py-10">
			<div className="w-11/12">
				<Table>
					<TableHeader>
						<TableRow>
							<TableCell colSpan={8}>
								<div className="flex justify-between items-center">
									<h2 className="font-bold">สรุปรายการคะแนน</h2>
									<div className="flex gap-4">
										<Input
											className="w-64"
											placeholder="ค้นหา"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>
								</div>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableHead
								onClick={() => requestSort("createOn")}
								className="cursor-pointer text-center w-2/12"
							>
								วันที่เล่น{" "}
								<ArrowUpDown className="inline-block ml-2" size={16} />
							</TableHead>
							<TableHead
								onClick={() => requestSort("name")}
								className="cursor-pointer text-center w-2/12"
							>
								ชื่อผู้ใช้{" "}
								<ArrowUpDown className="inline-block ml-2" size={16} />
							</TableHead>
							<TableHead
								onClick={() => requestSort("category")}
								className="cursor-pointer text-center w-2/12"
							>
								หมวดหมู่ <ArrowUpDown className="inline-block ml-2" size={16} />
							</TableHead>
							<TableHead
								onClick={() => requestSort("topic")}
								className="cursor-pointer text-center w-2/12"
							>
								หัวข้อ <ArrowUpDown className="inline-block ml-2" size={16} />
							</TableHead>
							<TableHead
								onClick={() => requestSort("subtopic")}
								className="cursor-pointer text-center w-2/12"
							>
								หัวข้อย่อย{" "}
								<ArrowUpDown className="inline-block ml-2" size={16} />
							</TableHead>
							<TableHead
								onClick={() => requestSort("score")}
								className="cursor-pointer text-center w-1/12"
							>
								คะแนน <ArrowUpDown className="inline-block ml-2" size={16} />
							</TableHead>
							<TableHead className="text-center w-2/12">ตัวเลือก</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={8}>
									<Loading />
								</TableCell>
							</TableRow>
						) : sortedData.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8}>
									<h2>ไม่พบข้อมูลคะแนน</h2>
								</TableCell>
							</TableRow>
						) : (
							paginatedData.map((item) => (
								<TableRow key={item._id}>
									<TableCell>
										<div className="font-medium">
											{thDateTime(item.createOn).split(" ")[0]}
										</div>
										<div className="text-sm text-gray-500">
											{thDateTime(item.createOn).split(" ")[1]}
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="font-medium">{item.name}</div>
										<div className="text-sm text-gray-500">{item.username}</div>
									</TableCell>
									<TableCell>
										<CategoryBadge category={item.category} />
									</TableCell>
									<TableCell>{item.topic}</TableCell>
									<TableCell>{item.subtopic}</TableCell>
									<TableCell className="text-center">{item.score}</TableCell>
									<TableCell className="text-center">
										<TooltipWrapper content="ลบคะแนน">
											<div
												role="button"
												onClick={() => handleDelete(item._id)}
												className="mr-2 cursor-pointer inline-flex items-center rounded-md p-2 hover:bg-red-400"
												// disabled={isDeleting}
											>
												{/* {isDeleting ? "กำลังลบ..." : ""} */}
												<Trash className="inline-block" size={16} />
											</div>
										</TooltipWrapper>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>

					{sortedData.length > 0 && (
						<TableFooter>
							<TableRow>
								<TableCell colSpan={8}>
									<Pagination
										currentPage={currentPage}
										totalPages={totalPages}
										onPageChange={setCurrentPage}
										itemsPerPage={itemsPerPage}
										totalItems={sortedData.length}
									/>
								</TableCell>
							</TableRow>
						</TableFooter>
					)}
				</Table>
			</div>
		</div>
	);
}
