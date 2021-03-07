import React from 'react';

import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import _, { valuesIn } from "lodash"
import { Link } from 'react-router-dom';
import { TitleOutlined } from '@material-ui/icons';
import { Box } from '@material-ui/core';

/**
 * Compares two strings, standard 1, -1, 0 format.
 * 
 * Utilizes LocaleCompare
 * 
 * @param {*} a 
 * @param {*} b 
 * @param {*} orderBy 
 */
const descendingComparator = (a: any, b: any, orderBy: string) => {
  const aVal = _.get(a, orderBy);
  const bVal = _.get(b, orderBy);

  // Was having issues comparing strings, "G.062" was not < or > than "G.052"
  return ('' + aVal).localeCompare(bVal);
}

const getComparator = (order: any, orderBy: string) => {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

const stableSort = (array: any[], comparator: any) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

type EnhancedTableHeadProps = {
  columns: any,
  classes: any,
  order: any,
  orderBy: any,
  onRequestSort: any
}

const EnhancedTableHead = ({ columns, classes, order, orderBy, onRequestSort }: EnhancedTableHeadProps) => {

  const createSortHandler = (property: any) => (event: any) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        {columns.map((column: any) => (
          <TableCell
            key={column.id}
            align={column.numeric ? 'right' : 'left'}
            padding={column.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
              {orderBy === column.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
    paddingBottom: 3
  },
}));

const EnhancedTableToolbar = ({ title, context }: any) => {
  const classes = useToolbarStyles();
  return (
    <Toolbar
      className={clsx(classes.root)}
    >
      <Box flexDirection="column">
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>
        {context && Object.keys(context).map(key => (
          <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>{key}:</span> {context[key]}</Typography>
        ))}
      </Box>
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

/**
 * Custom Cell to allow custom dynamic rows for each column cell
 * 
 * @param row
 * @param val
 * @param index 
 */
const CustomTableCell = ({ row, val, index }: any) => {

  if (val.link) {
    return (
      <TableCell key={`column-${index}`} align={val.numeric ? "right" : "left"}>
        <Link to={val.link(row)}>
          {_.get(row, val.id)}
        </Link>
      </TableCell>
    )
  } else {
    return (
      <TableCell key={`column-${index}`} align={val.numeric ? "right" : "left"}>
        {_.get(row, val.id)}
      </TableCell>
    )
  }
}

type CustomTableProps = {
  rows: any[],
  columns: any[],
  title: string,
  context?: any,
  collapseFunction?: any
}

const CustomTable = ({ rows, columns, title, context }: CustomTableProps) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Handle click on a table row
   */
  const handleClick = (event: any, name: number) => {

  };

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: any) => {
    setDense(event.target.checked);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar title={title} context={context} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              columns={columns}
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      key={row.id}
                    >
                      {columns.map((val, index) => <CustomTableCell row={row} val={val} index={index} />)}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div >
  );
}

export default CustomTable