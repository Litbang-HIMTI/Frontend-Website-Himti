export interface IStats {
	/** Namespace */
	ns: string;
	/** Number of documents */
	count: number;
	/** Collection size in bytes */
	size: number;
	/** Average object size in bytes */
	avgObjSize: number;
	/** (Pre)allocated space for the collection in bytes */
	storageSize: number;
	/** Number of extents (contiguously allocated chunks of datafile space) */
	numExtents: number;
	/** Number of indexes */
	nindexes: number;
	/** Size of the most recently created extent in bytes */
	lastExtentSize: number;
	/** Padding can speed up updates if documents grow */
	paddingFactor: number;
	/** A number that indicates the user-set flags on the collection. userFlags only appears when using the mmapv1 storage engine */
	userFlags?: number;
	/** Total index size in bytes */
	totalIndexSize: number;
	/** Size of specific indexes in bytes */
	indexSizes: {
		_id_: number;
		[index: string]: number;
	};
	/** `true` if the collection is capped */
	capped: boolean;
	/** The maximum number of documents that may be present in a capped collection */
	max: number;
	/** The maximum size of a capped collection */
	maxSize: number;
	/** The fields in this document are the names of the indexes, while the values themselves are documents that contain statistics for the index provided by the storage engine */
	indexDetails?: any;
	ok: number;
	/** The amount of storage available for reuse. The scale argument affects this value. */
	freeStorageSize?: number;
	/** An array that contains the names of the indexes that are currently being built on the collection */
	indexBuilds?: number;
	/** The sum of the storageSize and totalIndexSize. The scale argument affects this value */
	totalSize: number;
	/** The scale value used by the command. */
	scaleFactor: number;
}
export interface IstatsExtended extends IStats {
	loading: boolean;
	loadFail: boolean;
	extraData?: string;
}

export const emptyStats: IstatsExtended = {
	ns: "",
	count: 0,
	size: 1232,
	avgObjSize: 0,
	storageSize: 0,
	numExtents: 0,
	nindexes: 0,
	lastExtentSize: 0,
	paddingFactor: 0,
	totalIndexSize: 0,
	indexSizes: {
		_id_: 0,
	},
	capped: false,
	max: 0,
	maxSize: 0,
	indexDetails: {},
	ok: 0,
	freeStorageSize: 0,
	indexBuilds: 0,
	totalSize: 0,
	scaleFactor: 0,
	loading: true,
	loadFail: false,
};
